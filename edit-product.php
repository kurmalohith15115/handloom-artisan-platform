<?php

include "config/db.php";

$id = $_GET['id'];

$result = mysqli_query(
$conn,
"SELECT * FROM products WHERE id='$id'"
);

$product = mysqli_fetch_assoc($result);

if(isset($_POST['update_product']))
{
    $product_name = $_POST['product_name'];
    $price = $_POST['price'];
    $category = $_POST['category'];
    $stock = $_POST['stock'];
    $description = $_POST['description'];

    $sql = "UPDATE products SET

    product_name='$product_name',
    price='$price',
    category='$category',
    stock='$stock',
    description='$description'

    WHERE id='$id'";

    if($conn->query($sql))
    {
        header("Location: view-products.php");
    }
}

?>

<!DOCTYPE html>
<html>
<head>
<title>Edit Product</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<section class="form-section">

<h1>Edit Product</h1>

<form method="POST">

<input
type="text"
name="product_name"
value="<?php echo $product['product_name']; ?>"
required>

<input
type="number"
step="0.01"
name="price"
value="<?php echo $product['price']; ?>"
required>

<input
type="text"
name="category"
value="<?php echo $product['category']; ?>"
required>

<input
type="number"
name="stock"
value="<?php echo $product['stock']; ?>"
required>

<textarea
name="description"><?php echo $product['description']; ?></textarea>

<button
type="submit"
name="update_product">
Update Product
</button>

</form>

</section>

</body>
</html>