<?php

session_start();

include "config/db.php";

$customer_id = $_SESSION['customer_id'];

$sql = "
SELECT
cart.id,
products.product_name,
products.price,
products.image,
cart.quantity

FROM cart

JOIN products
ON cart.product_id = products.id

WHERE cart.customer_id='$customer_id'
";

$result = mysqli_query($conn,$sql);

$total = 0;

?>

<!DOCTYPE html>
<html>
<head>
<title>My Cart</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<h1 align="center">My Cart</h1>

<div class="cart-container">

<?php while($row=mysqli_fetch_assoc($result)){ ?>

<?php
$subtotal =
$row['price'] *
$row['quantity'];

$total += $subtotal;
?>

<div class="cart-item">

<img
src="uploads/<?php echo $row['image']; ?>"
width="100">

<div>

<h3>
<?php echo $row['product_name']; ?>
</h3>

<p>
₹<?php echo $row['price']; ?>
</p>

<p>
Quantity:
<?php echo $row['quantity']; ?>
</p>

<p>
Subtotal:
₹<?php echo $subtotal; ?>
</p>

<a href="remove-cart.php?id=<?php echo $row['id']; ?>">
Remove
</a>

</div>

</div>

<?php } ?>

<h2>
Grand Total: ₹<?php echo $total; ?>
</h2>

<a href="checkout.php">
<button>
Proceed To Checkout
</button>
</a>

</div>

</body>
</html>