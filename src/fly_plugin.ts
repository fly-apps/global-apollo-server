import { env } from 'process';

function inSecondaryRegion() {
  return env.FLY_REGION && env.PRIMARY_REGION && env.FLY_REGION !== env.PRIMARY_REGION 
}

export default function (): any {
  return {
    async requestDidStart() {
      return {
        async willSendResponse({ errors, response: { http } }: any) {
          if (inSecondaryRegion() && errors?.[0]?.message.includes("PreventCommandIfReadOnly")) {
            console.log(`Detected a write attempt in secondary region ${env.FLY_REGION}. Replaying in ${env.PRIMARY_REGION}`)
            http.status = 429
            http.headers.set("Fly-Replay", `region=${env.PRIMARY_REGION}; state=captured_write`)
          }
        }
      }
    }
  }
}
