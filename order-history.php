<?php

session_start();

if(!isset($_SESSION['customer_id']))
{
    header("Location: customer-login.html");
    exit();
}

include "config/db.php";

$customer_id = $_SESSION['customer_id'];

$orders = mysqli_query(
$conn,
"SELECT * FROM orders
WHERE customer_id='$customer_id'
ORDER BY id DESC"
);

?>

<!DOCTYPE html>
<html>
<head>
<title>Order History</title>

<style>

body{
    font-family: Arial, sans-serif;
    background:#f4f4f4;
    margin:0;
    padding:0;
}

header{
    background:#8B4513;
    color:white;
    padding:15px;
}

header a{
    color:white;
    text-decoration:none;
    margin-right:15px;
}

.container{
    width:90%;
    margin:20px auto;
}

.order-card{
    background:white;
    padding:20px;
    margin-bottom:20px;
    border-radius:10px;
    box-shadow:0 2px 5px rgba(0,0,0,0.1);
}

.pending{
    color:orange;
    font-weight:bold;
}

.processing{
    color:blue;
    font-weight:bold;
}

.shipped{
    color:purple;
    font-weight:bold;
}

.delivered{
    color:green;
    font-weight:bold;
}

.cancelled{
    color:red;
    font-weight:bold;
}

</style>

</head>
<body>

<header>

<h2>Handloom Artisan Platform</h2>

<a href="customer-dashboard.php">Dashboard</a>
<a href="customer-products.php">Shop</a>
<a href="cart.php">Cart</a>
<a href="customer-logout.php">Logout</a>

</header>

<div class="container">

<h1>My Orders</h1>

<?php
while($row = mysqli_fetch_assoc($orders))
{
    $statusClass = strtolower($row['status']);
?>

<div class="order-card">

<h3>Order #<?php echo $row['id']; ?></h3>

<p>
<strong>Amount:</strong>
₹<?php echo $row['amount']; ?>
</p>

<p>
<strong>Status:</strong>
<span class="<?php echo $statusClass; ?>">
<?php echo $row['status']; ?>
</span>
</p>

<p>
<strong>Date:</strong>
<?php echo $row['created_at']; ?>
</p>

</div>

<?php
}
?>

</div>

</body>
</html>