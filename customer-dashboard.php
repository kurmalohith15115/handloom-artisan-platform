<?php

session_start();

if(!isset($_SESSION['customer_id']))
{
    header("Location: customer-login.html");
    exit();
}

?>

<!DOCTYPE html>
<html>
<head>
<title>Customer Dashboard</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>

<div class="logo">
Handloom Artisan Platform
</div>

<nav>
    <a href="view-products.php">
    Shop Products
    </a>

    <a href="cart.php">
    Cart
    </a>

    <a href="order-history.php">
    My Orders
    </a>

    <a href="customer-logout.php">
    Logout
    </a>
</nav>

</header>

<h1
style="
text-align:center;
margin-top:30px;">
Welcome
<?php echo $_SESSION['customer_name']; ?>
</h1>

<div class="stats">

<div class="stat-box">
<h3>Browse Products</h3>
<p>🛍️</p>
</div>

<div class="stat-box">
<h3>My Cart</h3>
<p>🛒</p>
</div>

<div class="stat-box">
<h3>My Orders</h3>
<p>📦</p>
</div>

</div>

</body>
</html>