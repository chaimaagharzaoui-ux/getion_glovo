export default function StatCard({ title, value, sub, subColor = "#22C55E", loading = false }) {
  const Skeleton = ({ w = "70%", h = 14, mt = 0 }) => (
    <div
      style={{
        width: w,
        height: h,
        marginTop: mt,
        borderRadius: 8,
        background: "#f0f0f0",
        animation: "pulse 1.1s ease-in-out infinite",
      }}
    />
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 24,
        border: "1px solid #eee",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#888", fontWeight: 700 }}>{title}</div>
      {loading ? (
        <>
          <Skeleton w="58%" h={28} mt={10} />
          <Skeleton w="45%" h={12} mt={8} />
        </>
      ) : (
        <>
          <div style={{ marginTop: 8, fontSize: 27, color: "#FF6B00", fontWeight: 900 }}>{value ?? "—"}</div>
          {sub ? (
            <div style={{ marginTop: 6, color: subColor, fontSize: 12, fontWeight: 700 }}>{sub}</div>
          ) : null}
        </>
      )}
    </div>
  );
}
