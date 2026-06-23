<?php

include "config/db.php";

$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';

$sql = "SELECT * FROM products WHERE 1=1";

if($search != '')
{
    $sql .= " AND product_name LIKE '%$search%'";
}

if($category != '')
{
    $sql .= " AND category='$category'";
}

$sql .= " ORDER BY id DESC";

$products = mysqli_query($conn, $sql);

?>

<!DOCTYPE html>
<html>
<head>
    <title>Customer Products</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>

<div class="logo">
Handloom Artisan Platform
</div>

<nav>
    <a href="customer-dashboard.php">Dashboard</a>
    <a href="cart.php">Cart</a>
    <a href="order-history.php">My Orders</a>
    <a href="customer-logout.php">Logout</a>
</nav>

</header>

<section class="collections">

<h1>Our Handloom Products</h1>

<form method="GET" style="text-align:center; margin:20px;">

<input
type="text"
name="search"
placeholder="Search Products">

<select name="category">

<option value="">All Categories</option>
<option value="Saree">Saree</option>
<option value="Shawl">Shawl</option>
<option value="Dupatta">Dupatta</option>
<option value="Fabric">Fabric</option>

</select>

<button type="submit">
Search
</button>

</form>

<div class="product-grid">

<?php
while($row = mysqli_fetch_assoc($products))
{
?>

<div class="product-card">

<img
src="uploads/<?php echo $row['image']; ?>"
alt="<?php echo $row['product_name']; ?>">

<h3>
<?php echo $row['product_name']; ?>
</h3>

<p>
₹<?php echo $row['price']; ?>
</p>

<p>
Category:
<?php echo $row['category']; ?>
</p>

<p>
Stock:
<?php echo $row['stock']; ?>
</p>

<p>
<?php echo $row['description']; ?>
</p>

<!-- Add To Cart Form -->

<!-- Add To Cart / Out Of Stock -->

<?php
if($row['stock'] > 0)
{
?>

<form action="add-to-cart.php" method="POST">

<input
type="hidden"
name="product_id"
value="<?php echo $row['id']; ?>">

<button type="submit">
Add To Cart
</button>

</form>

<?php
}
else
{
?>

<button disabled>
Out Of Stock
</button>

<?php
}
?>

<br>

<!-- Review Form -->

<form action="submit-review.php" method="POST">

<input
type="hidden"
name="product_id"
value="<?php echo $row['id']; ?>">

<select name="rating" required>
<option value="">Rating</option>
<option value="5">⭐⭐⭐⭐⭐</option>
<option value="4">⭐⭐⭐⭐</option>
<option value="3">⭐⭐⭐</option>
<option value="2">⭐⭐</option>
<option value="1">⭐</option>
</select>

<br><br>

<textarea
name="review"
placeholder="Write your review"
required>
</textarea>

<br><br>

<button type="submit">
Submit Review
</button>

</form>

<hr>

<?php

$reviews = mysqli_query(
$conn,
"SELECT reviews.*, customers.name
FROM reviews
JOIN customers
ON reviews.customer_id = customers.id
WHERE reviews.product_id='".$row['id']."'
ORDER BY reviews.id DESC"
);

while($r = mysqli_fetch_assoc($reviews))
{
?>

<div style="margin-top:10px; text-align:left;">

<strong>
<?php echo $r['name']; ?>
</strong>

<br>

<?php echo str_repeat("⭐",$r['rating']); ?>

<br>

<?php echo $r['review']; ?>

<br><br>

</div>

<?php
}
?>

</div>

<?php
}
?>

</div>

</section>

</body>
</html>