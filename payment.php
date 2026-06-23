<?php
session_start();

$total = $_GET['amount'];
?>

<!DOCTYPE html>
<html>
<head>
<title>Payment</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<div style="text-align:center;padding:50px;">

<h1>Payment Gateway</h1>

<h2>Total Amount: ₹<?php echo $total; ?></h2>

<form action="payment-success.php" method="POST">

<input
type="hidden"
name="amount"
value="<?php echo $total; ?>">

<button type="submit">
Pay Now
</button>

</form>

</div>

</body>
</html>