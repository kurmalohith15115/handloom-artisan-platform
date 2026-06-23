<?php
session_start();
include "config/db.php";

$customer_id = $_SESSION['customer_id'];

$total = 0;

$sql = "
SELECT
products.price,
cart.quantity

FROM cart

JOIN products
ON cart.product_id = products.id

WHERE cart.customer_id='$customer_id'
";

$result = mysqli_query($conn,$sql);

while($row=mysqli_fetch_assoc($result))
{
    $total += $row['price'] * $row['quantity'];
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Checkout</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<section class="form-section">

<h1>Checkout</h1>
<h2>Total Amount: ₹<?php echo $total; ?></h2>

<form action="payment.php" method="GET">

<input
type="text"
name="customer_name"
placeholder="Full Name"
required>

<input
type="email"
name="customer_email"
placeholder="Email"
required>

<input
type="text"
name="phone"
placeholder="Phone Number"
required>

<textarea
name="address"
placeholder="Delivery Address"
required>
</textarea>

<input
type="hidden"
name="amount"
value="<?php echo $total; ?>">

<button type="submit">
Place Order
</button>

</form>

</section>

</body>
</html>