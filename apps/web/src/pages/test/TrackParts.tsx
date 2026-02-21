export const TrackParts = () => {
  return (
    <>
      {/* トラック本体 */}
      <img src="/images/transfer/track.svg" alt="track_body" class="track-part track-body" />

      {/* 窓から出るお化けの頭 */}
      <img src="/images/transfer/head_track.svg" alt="head_track" class="track-part head-track" />

      {/* タイヤ（回転させるために共通クラス tire を付与） */}
      <img src="/images/transfer/back_tire.svg" alt="back_tire" class="track-part tire back-tire" />
      <img src="/images/transfer/front_tire.svg" alt="front_tire" class="track-part tire front-tire" />
    </>
  );
};
