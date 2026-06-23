

<?php

include "config/db.php";

$result = mysqli_query($conn,"SELECT * FROM artisans ORDER BY id DESC LIMIT 1");

$row = mysqli_fetch_assoc($result);

?>

<?php

session_start();

if(!isset($_SESSION['artisan_id']))
{
    header("Location: login.html");
    exit();
}

include "config/db.php";

$result = mysqli_query(
    $conn,
    "SELECT * FROM artisans WHERE id=".$_SESSION['artisan_id']
);

$row = mysqli_fetch_assoc($result);

$productResult = $conn->query("SELECT COUNT(*) as total FROM products");
$productCount = $productResult->fetch_assoc()['total'];

$orderResult = $conn->query("SELECT COUNT(*) as total FROM orders");
$orderCount = $orderResult->fetch_assoc()['total'];

$revenueResult = $conn->query("SELECT SUM(amount) as revenue FROM orders");
$revenue = $revenueResult->fetch_assoc()['revenue'];

?>


<!DOCTYPE html>
<html>
<head>
<title>Artisan Dashboard</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<h1 style="text-align:center; margin-top:20px;">
Welcome <?php echo $_SESSION['artisan_name']; ?>
</h1>

<header>

<div class="logo">
Handloom Artisan Platform
</div>

<nav>
    <a href="dashboard.php">Dashboard</a>
    <a href="add-product.php">Add Product</a>
    <a href="view-products.php">Products</a>
    <a href="logout.php">Logout</a>
</nav>

</header>

<div class="profile-card">

<img src="uploads/<?php echo $row['image']; ?>">

<h2><?php echo $row['name']; ?></h2>

<p><strong>Email:</strong> <?php echo $row['email']; ?></p>

<p><strong>Phone:</strong> <?php echo $row['phone']; ?></p>

<p><strong>Location:</strong> <?php echo $row['location']; ?></p>

<p><strong>Craft:</strong> <?php echo $row['craft']; ?></p>

<p><strong>Experience:</strong> <?php echo $row['experience']; ?></p>

</div>

<div class="stats">

<div class="stat-box">
<h3>Total Products</h3>
<p><?php echo $productCount; ?></p>
</div>

<div class="stat-box">
<h3>Total Orders</h3>
<p><?php echo $orderCount; ?></p>
</div>

<div class="stat-box">
<h3>Revenue</h3>
<p>₹<?php echo $revenue; ?></p>
</div>

<div class="stat-box">
<h3>Rating</h3>
<p>4.8★</p>
</div>

</div>

</body>
</html>