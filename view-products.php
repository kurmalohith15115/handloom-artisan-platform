<?php
include "config/db.php";

$products = mysqli_query(
    $conn,
    "SELECT * FROM products ORDER BY id DESC"
);
?>

<!DOCTYPE html>
<html>
<head>
    <title>View Products</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>

<div class="logo">
Handloom Artisan Platform
</div>

<nav>
    <a href="index.html">Home</a>
    <a href="collections.html">Collections</a>
    <a href="artisans.html">Artisans</a>
    <a href="add-product.php">Add Product</a>
    <a href="dashboard.php">Dashboard</a>
</nav>

</header>

<section class="collections">

<h1>Our Handloom Products</h1>

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

<form action="add-to-cart.php" method="POST">

<input
type="hidden"
name="product_id"
value="<?php echo $row['id']; ?>">

<button type="submit">
Add To Cart
</button>

</form>

</div>

<?php
}
?>

</div>

</section>

</body>
</html>