import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import BottomNav from "../../components/livreur/BottomNav.jsx";

const BG = "#09090F";
const TEXT = "#F0F0FA";
const MUTED = "#7777A0";
const ORANGE = "#FF6B00";
const GREEN = "#22C55E";
const RED = "#EF4444";
const CARD = "#18181F";
const BORDER = "#26263A";

function mergeOrder(list, o) {
  return [o, ...list.filter((x) => x.id !== o.id)];
}

function OrderCard({ order, showDeliver, onDeliver }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div>
          <strong style={{ color: TEXT }}>{order.client_nom}</strong>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
            #{order.numero}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 20,
            background: "rgba(255,107,0,0.15)",
            color: ORANGE,
          }}
        >
          {order.statusBadge}
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: MUTED }}>{order.product}</div>
      <div style={{ marginTop: 4, fontSize: 13, color: MUTED }}>{order.address}</div>
      <div style={{ marginTop: 6, fontSize: 13, color: TEXT }}>
        {order.entreprise_nom ? `${order.entreprise_nom} · ` : ""}
        {order.price}
      </div>
      {showDeliver ? (
        <button
          type="button"
          onClick={() => onDeliver(order.id)}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Marquer comme livré
        </button>
      ) : null}
    </div>
  );
}

export default function DashboardLivreur() {
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const listsRef = useRef({ current: [], delivered: [], rejected: [] });
  const [online, setOnline] = useState(true);
  const [bottomTab, setBottomTab] = useState("accueil");
  const [current, setCurrent] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [popups, setPopups] = useState([]);
  const [loadError, setLoadError] = useState("");

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("livreur_token");
    if (!token) return;
    try {
      const res = await api.get("/api/driver/orders/");
      const cur = res.data?.current || [];
      const del = res.data?.delivered || [];
      const rej = res.data?.rejected || [];
      setCurrent(cur);
      setDelivered(del);
      setRejected(rej);
      listsRef.current = { current: cur, delivered: del, rejected: rej };
      setLoadError("");
    } catch {
      setLoadError("Impossible de charger les commandes.");
    }
  }, []);

  useEffect(() => {
    listsRef.current = { current, delivered, rejected };
  }, [current, delivered, rejected]);

  useEffect(() => {
    const token = localStorage.getItem("livreur_token");
    if (!token) {
      navigate("/livreur/login", { replace: true });
      return;
    }
    fetchOrders();
  }, [navigate, fetchOrders]);

  const sendWs = useCallback((obj) => {
    const w = wsRef.current;
    if (w && w.readyState === WebSocket.OPEN) w.send(JSON.stringify(obj));
  }, []);

  const removePopup = useCallback((orderId) => {
    setPopups((p) => p.filter((x) => x.order_id !== orderId));
  }, []);

  const connectWs = useCallback(() => {
    const token = localStorage.getItem("livreur_token");
    if (!token) return;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/ws/driver/?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      let msg = {};
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.type === "new_order" && msg.order_id != null) {
        const oid = msg.order_id;
        const { current: c, delivered: d, rejected: r } = listsRef.current;
        if (c.some((x) => x.id === oid) || d.some((x) => x.id === oid) || r.some((x) => x.id === oid)) {
          return;
        }
        setPopups((prev) => {
          if (prev.some((x) => x.order_id === oid)) return prev;
          return [msg, ...prev];
        });
        return;
      }
      if (msg.type === "order_cancelled" && msg.order_id != null) {
        removePopup(msg.order_id);
        return;
      }
      if (msg.type === "order_accepted_ok" && msg.order) {
        removePopup(msg.order.id);
        setCurrent((list) => mergeOrder(list, msg.order));
        return;
      }
      if (msg.type === "order_rejected_ok" && msg.order) {
        removePopup(msg.order.id);
        setRejected((list) => mergeOrder(list, msg.order));
        return;
      }
      if (msg.type === "mark_delivered_ok" && msg.order) {
        const id = msg.order.id;
        setCurrent((list) => list.filter((x) => x.id !== id));
        setDelivered((list) => mergeOrder(list, msg.order));
        return;
      }
      if (msg.type === "error") {
        window.alert(`Action impossible : ${msg.code || msg.action || "erreur"}`);
        fetchOrders();
      }
    };

    ws.onclose = () => {
      setTimeout(connectWs, 3500);
    };
  }, [removePopup, fetchOrders]);

  useEffect(() => {
    const token = localStorage.getItem("livreur_token");
    if (!token) return undefined;
    connectWs();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  const onAcceptPopup = (orderId) => {
    removePopup(orderId);
    sendWs({ type: "order_accepted", order_id: orderId });
  };

  const onRejectPopup = (orderId) => {
    removePopup(orderId);
    sendWs({ type: "order_rejected", order_id: orderId });
  };

  const onMarkDelivered = (orderId) => {
    sendWs({ type: "mark_delivered", order_id: orderId });
  };

  const statusDot = online ? GREEN : RED;
  const statusLabel = online ? "En ligne" : "Hors ligne";

  const dashboardBody = (
    <>
      {loadError ? (
        <div style={{ margin: 16, padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.15)", color: RED, fontWeight: 600 }}>
          {loadError}
        </div>
      ) : null}

      <div
        style={{
          margin: 16,
          borderRadius: 18,
          padding: "18px 18px 20px",
          background: "linear-gradient(135deg, #FF6B00 0%, #cc4400 100%)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900 }}>{online ? "En ligne 🟢" : "Hors ligne"}</div>
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, opacity: 0.95 }}>
          Actuelles : {current.length} · Livrées : {delivered.length} · Rejetées : {rejected.length}
        </div>
      </div>

      <div style={{ padding: "0 16px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <section>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: MUTED, marginBottom: 10 }}>COMMANDES ACTUELLES</div>
          {current.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>Aucune.</p>
          ) : (
            current.map((o) => <OrderCard key={o.id} order={o} showDeliver onDeliver={onMarkDelivered} />)
          )}
        </section>
        <section>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: MUTED, marginBottom: 10 }}>LIVRÉES</div>
          {delivered.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>Aucune.</p>
          ) : (
            delivered.map((o) => <OrderCard key={o.id} order={o} showDeliver={false} />)
          )}
        </section>
        <section>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: MUTED, marginBottom: 10 }}>REJETÉES</div>
          {rejected.length === 0 ? (
            <p style={{ color: MUTED, fontSize: 13 }}>Aucune.</p>
          ) : (
            rejected.map((o) => <OrderCard key={`r-${o.id}`} order={o} showDeliver={false} />)
          )}
        </section>
      </div>

      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 320,
          maxWidth: "calc(100vw - 32px)",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {popups.map((n) => (
          <div
            key={n.order_id}
            style={{
              background: "#fff",
              border: `2px solid ${ORANGE}`,
              borderRadius: 12,
              padding: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              color: "#1a1a1a",
            }}
          >
            <strong>Nouvelle commande</strong>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.45 }}>
              <div>
                <b>Client :</b> {n.client_name}
              </div>
              <div>
                <b>Produit :</b> {n.product}
              </div>
              <div>
                <b>Adresse :</b> {n.address}
              </div>
              <div>
                <b>Prix :</b> {n.price}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => onRejectPopup(n.order_id)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1px solid ${RED}`,
                  background: "rgba(239,68,68,0.1)",
                  color: RED,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Rejeter
              </button>
              <button
                type="button"
                onClick={() => onAcceptPopup(n.order_id)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: GREEN,
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Accepter
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const placeholder = (title, emoji) => (
    <div style={{ padding: 24, flex: 1, display: "grid", placeItems: "center", textAlign: "center", color: MUTED }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
        <div style={{ fontWeight: 800, color: TEXT, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>Section à venir.</div>
      </div>
    </div>
  );

  let body;
  if (bottomTab === "accueil") body = dashboardBody;
  else if (bottomTab === "livraisons") body = placeholder("Livraisons", "📦");
  else if (bottomTab === "gains") body = placeholder("Gains", "💰");
  else body = placeholder("Profil", "👤");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: BG,
          borderBottom: `1px solid ${BORDER}`,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 17, color: ORANGE }}>⚡ Swift Livreur</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: statusDot,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: online ? GREEN : RED, whiteSpace: "nowrap" }}>{statusLabel}</span>
          <button
            type="button"
            onClick={() => setOnline((v) => !v)}
            style={{
              width: 48,
              height: 28,
              borderRadius: 999,
              border: "none",
              background: online ? GREEN : "#3f3f4f",
              cursor: "pointer",
              position: "relative",
            }}
            aria-label="Basculer en ligne"
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: online ? 24 : 3,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", paddingBottom: 8 }}>{body}</div>

      <BottomNav active={bottomTab} onChange={setBottomTab} />
    </div>
  );
}
