// e2e の addInitScript で window に生やす計測用プロパティ
interface Window {
  __timerTextCalls: string[];
  __pipRequests: number;
  __documentPipRequestCount: number;
  __documentPipCloseCount: number;
}
