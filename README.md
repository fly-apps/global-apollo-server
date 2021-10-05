Run Apollo Server with Prisma in a global deployment setup on Fly.io. Based on the official Prisma example located here: https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql.
# Setup

First we need to create a Postgres cluster and scale it to run in a primary and secondary region. Using regions distant from each other (`ord` and `sin`, for example) should make it easier to run performance and latency tests.

First, create the cluster in the region you intend to accept writes in, substituting the `name` argument.

```
fly postgres create --region sin --name global-apollo-server-db
```

Add a volume in the secondary region, then scale the cluster to bring up a read-only replica in `ord`.

```
fly volumes create pg_data --region ord -a global-apollo-sever-db
fly scale count 3 -a global-apollo-sever-db
```

Check the status of the cluster. Once all VMs are passing health checks, we're ready to deploy the application.

In this source dir, run `fly launch --name global-apollo-server` with your favorite app name. Don't deploy it yet. Let's set `DATABASE_URL` in the app secrets by attaching the Postgres cluster to it.

```
fly postgres attach -a global-apollo-db --postgres-app global-apollo-server-db
```

If you picked a different primary region than `sin`, update `PRIMARY_REGION` in `fly.toml`.

Time to deploy! This initial deployment should happen in the primary region to migrate our database for the first time.

```
fly regions set sin
fly deploy
```

Check that your app is actually working with `fly open`.

Now we'll scale the app to run in two regions. This should instruct the app to use a read-only replica in `ord`.

```
fly regions set ord sin
fly regions backup ord sin
fly scale count 2 --max-per-region 1
```

Finally we should be able to test a write. Ideally, you would be located near the secondary region, and just run `./remote_query.sh` after having replaced the URL inside the script with your app URL. If things are working, this write attempt should get replayed successfully. Check `fly logs` to see if that's the case.