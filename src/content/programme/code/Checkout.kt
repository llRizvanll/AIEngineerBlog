package programme

// region: states
enum class OrderState { PAYMENT_PENDING, PAID, FAILED, CANCELLED, REFUND_DUE }

/** The only moves an order can make. Anything else is ignored rather than guessed at. */
private val ALLOWED = mapOf(
  OrderState.PAYMENT_PENDING to setOf(OrderState.PAID, OrderState.FAILED, OrderState.CANCELLED),
  OrderState.CANCELLED to setOf(OrderState.REFUND_DUE),   // paid after cancelling: give it back
)

data class Order(val id: String, val amount: Long, val state: OrderState)
// endregion

// region: service
class OrderService(private val priceOf: (cartId: String) -> Long) {
  private val byKey = HashMap<String, Order>()
  private val byId = HashMap<String, String>()
  private val seenEvents = HashSet<String>()
  private var nextOrder = 880

  /** A repeat with the same key gets the stored order back. The phone's price is never read. */
  @Synchronized
  fun create(idempotencyKey: String, cartId: String): Order =
    byKey.getOrPut(idempotencyKey) {
      nextOrder += 1
      val order = Order("o-$nextOrder", priceOf(cartId), OrderState.PAYMENT_PENDING)
      byId[order.id] = idempotencyKey
      order
    }

  /** Providers resend webhooks, so each event ID counts once. */
  @Synchronized
  fun onWebhook(eventId: String, orderId: String, succeeded: Boolean): Order {
    val key = byId.getValue(orderId)
    val order = byKey.getValue(key)
    if (!seenEvents.add(eventId)) return order
    val wanted = when {
      !succeeded -> OrderState.FAILED
      order.state == OrderState.CANCELLED -> OrderState.REFUND_DUE
      else -> OrderState.PAID
    }
    if (wanted !in ALLOWED[order.state].orEmpty()) return order
    return order.copy(state = wanted).also { byKey[key] = it }
  }

  @Synchronized
  fun cancel(orderId: String): Order {
    val key = byId.getValue(orderId)
    val order = byKey.getValue(key)
    if (OrderState.CANCELLED !in ALLOWED[order.state].orEmpty()) return order
    return order.copy(state = OrderState.CANCELLED).also { byKey[key] = it }
  }

  /** Daily: find what the provider charged that we still think is waiting. */
  @Synchronized
  fun reconcile(providerPaidIds: Set<String>): List<String> =
    byKey.values.filter { it.state == OrderState.PAYMENT_PENDING && it.id in providerPaidIds }.map { it.id }
}
// endregion

// region: screen
sealed interface CheckoutUi {
  data object Confirming : CheckoutUi
  data class Done(val orderId: String) : CheckoutUi
  data object TryAnotherMethod : CheckoutUi
  data object Refunding : CheckoutUi
}

/** No network answer means Confirming. The phone never claims failure when it does not know. */
fun checkoutUi(lastKnown: Order?): CheckoutUi = when (lastKnown?.state) {
  null, OrderState.PAYMENT_PENDING -> CheckoutUi.Confirming
  OrderState.PAID -> CheckoutUi.Done(lastKnown.id)
  OrderState.FAILED, OrderState.CANCELLED -> CheckoutUi.TryAnotherMethod
  OrderState.REFUND_DUE -> CheckoutUi.Refunding
}
// endregion
