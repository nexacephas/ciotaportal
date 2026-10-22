import { useMemo, useState } from "react";
import { CreditCard, Printer, ReceiptText } from "lucide-react";
import { useDemo } from "../../../hooks/useDemo";
import { getChargeReceipt, getVisibleCharges } from "../../../services/billingService";
import { formatCurrency, formatDate, formatStatus } from "../../../utils/formatters";
import Badge from "../../../components/Badge/Badge";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Modal from "../../../components/Modal/Modal";
import PageHeader from "../../../components/PageHeader/PageHeader";
import "./Billing.css";

export default function Billing() {
  const demo = useDemo();
  const member = demo.members.find((item) => item.email === demo.demoUser?.email);
  const charges = useMemo(() => getVisibleCharges(demo.data, { role: demo.role, email: demo.demoUser?.email, memberId: member?.id }), [demo.data, demo.role, demo.demoUser, member?.id]);
  const payments = demo.payments.filter((payment) => payment.memberId === member?.id || charges.some((charge) => charge.id === payment.chargeId));
  const [paymentAttempt, setPaymentAttempt] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const startPayment = (charge) => {
    setError(""); setNotice("");
    const result = demo.initiatePayment(charge.id);
    if (result.error) setError(result.error); else setPaymentAttempt(result.payment);
  };
  const complete = (outcome) => {
    if (!paymentAttempt) return;
    setError("");
    const result = demo.completePayment(paymentAttempt.id, outcome);
    if (result.error) setError(result.error);
    else { setPaymentAttempt(result.payment); setNotice(result.payment.status === "paid" ? "Payment successful. Your receipt is ready." : `Demo payment ${result.payment.status}. The outstanding charge can be retried.`); }
  };
  const receipt = receiptId ? getChargeReceipt(demo.data, receiptId) : null;
  return <main className="billing-page">
    <PageHeader eyebrow="Member services" title="Billing and payments" description="Review outstanding application fees, membership dues, renewal charges, and demo transaction history." />
    {error && <p className="billing-error" role="alert">{error}</p>}{notice && <p className="billing-success" role="status">{notice}</p>}
    <div className="billing-disclaimer"><CreditCard size={17} /><span>Simulated checkout only. No card number, CVV, PIN, or payment credentials are requested or stored. No money is collected.</span></div>
    <Card><h2>Outstanding charges</h2>{charges.filter((charge) => ["due", "pending"].includes(charge.status)).length ? <div className="billing-charge-list">{charges.filter((charge) => ["due", "pending"].includes(charge.status)).map((charge) => <article className="billing-charge" key={charge.id}><div><span className="billing-charge-type">{formatStatus(charge.type)} · {charge.reference}</span><h3>{charge.purpose}</h3><p>Due {formatDate(charge.dueAt)} · {charge.currency}</p><small>{charge.status === "pending" ? "A simulated transaction is pending. Resume it to record an outcome." : "Payment is due."}</small></div><div className="billing-charge-action"><strong>{formatCurrency(charge.amount, charge.currency)}</strong><Button size="sm" onClick={() => startPayment(charge)}>{charge.status === "pending" ? "Resume payment" : "Pay charge"}</Button></div></article>)}</div> : <EmptyState title="No outstanding charges" description="New application and renewal charges will appear here." />}</Card>
    <Card><h2>Payment history</h2>{payments.length ? <div className="billing-payment-list">{payments.map((payment) => { const charge = charges.find((item) => item.id === payment.chargeId); return <article key={payment.id} className="billing-payment-row"><div><strong>{payment.purpose}</strong><small>{payment.reference}{charge ? ` · ${charge.reference}` : ""}</small><small>{payment.paidAt ? formatDate(payment.paidAt) : payment.createdAt ? formatDate(payment.createdAt) : "No completion date"}</small></div><div><strong>{formatCurrency(payment.amount, payment.currency || "NGN")}</strong><Badge status={payment.status}>{formatStatus(payment.status)}</Badge></div>{payment.status === "paid" && payment.receiptReference && <Button variant="outline" size="sm" onClick={() => setReceiptId(payment.id)}><ReceiptText size={15} /> Receipt</Button>}</article>; })}</div> : <EmptyState title="No payment history" description="Completed and attempted demo transactions will be listed here." />}</Card>
    <Modal open={Boolean(paymentAttempt)} onClose={() => setPaymentAttempt(null)} title="Simulated payment checkout">
      {paymentAttempt && <div className="payment-checkout"><p><strong>{paymentAttempt.purpose}</strong></p><p>{formatCurrency(paymentAttempt.amount, paymentAttempt.currency || "NGN")} · {paymentAttempt.reference}</p><p className="small-note">Select a fictional outcome for this local demonstration. A successful outcome updates the related charge and renewal once.</p>{paymentAttempt.status === "pending" ? <div className="payment-outcomes"><Button onClick={() => complete("success")}>Simulate successful payment</Button><Button variant="outline" onClick={() => complete("failure")}>Simulate failure</Button><Button variant="outline" onClick={() => complete("cancel")}>Cancel attempt</Button></div> : <div className={`billing-${paymentAttempt.status}`} role="status">Payment {paymentAttempt.status === "paid" ? "successful" : paymentAttempt.status}.{paymentAttempt.receiptReference && <p>Receipt reference: <strong>{paymentAttempt.receiptReference}</strong></p>}</div>}</div>}
    </Modal>
    <Modal open={Boolean(receipt)} onClose={() => setReceiptId(null)} title="Demo payment receipt">
      {receipt?.payment && <div className="receipt-content"><div className="receipt-brand">CIoTA NIGERIA <span>DEMO RECEIPT</span></div><h3>{receipt.charge?.purpose ?? receipt.payment.purpose}</h3><dl><div><dt>Receipt</dt><dd>{receipt.payment.receiptReference}</dd></div><div><dt>Transaction</dt><dd>{receipt.payment.reference}</dd></div><div><dt>Charge reference</dt><dd>{receipt.charge?.reference ?? "Standalone transaction"}</dd></div><div><dt>Amount</dt><dd>{formatCurrency(receipt.payment.amount, receipt.payment.currency || "NGN")}</dd></div><div><dt>Paid on</dt><dd>{receipt.payment.paidAt ? new Date(receipt.payment.paidAt).toLocaleString("en-NG") : "—"}</dd></div><div><dt>Status</dt><dd>Successful simulated payment</dd></div></dl><p>This receipt is for prototype demonstration only and is not proof of a real payment.</p><Button onClick={() => window.print()}><Printer size={16} /> Print receipt</Button></div>}
    </Modal>
  </main>;
}
