<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

include "config/db.php";


if(isset($_POST['add_product']))
{
    $artisan_id = $_POST['artisan_id'];
    $product_name = $_POST['product_name'];
    $price = $_POST['price'];
    $category = $_POST['category'];
    $stock = $_POST['stock'];
    $description = $_POST['description'];

    $imageName = time() . "_" . $_FILES['image']['name'];
    $tmpName = $_FILES['image']['tmp_name'];

    move_uploaded_file(
        $tmpName,
        "uploads/" . $imageName
    );

    $sql = "INSERT INTO products
(
    artisan_id,
    product_name,
    price,
    description,
    image,
    category,
    stock
)
VALUES
(
    '$artisan_id',
    '$product_name',
    '$price',
    '$description',
    '$imageName',
    '$category',
    '$stock'
)";

        if($conn->query($sql))
{
$product_id = mysqli_insert_id($conn);

if(!empty($_FILES['gallery']['name'][0]))
{
    foreach($_FILES['gallery']['tmp_name'] as $key => $tmpName)
    {
        $galleryImage =
        time() . "_" . $_FILES['gallery']['name'][$key];

        move_uploaded_file(
            $tmpName,
            "uploads/" . $galleryImage
        );

        mysqli_query(
            $conn,
            "INSERT INTO product_images
            (
                product_id,
                image
            )
            VALUES
            (
                '$product_id',
                '$galleryImage'
            )"
        );
    }
}
        
        echo "<h2>Product Added Successfully ✅</h2>";
    }
    else
    {
        echo $conn->error;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Add Product</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<section class="form-section">

<h1>Add Product</h1>

<form method="POST" enctype="multipart/form-data">

<input
type="number"
name="artisan_id"
placeholder="Artisan ID"
required>

<input
type="text"
name="product_name"
placeholder="Product Name"
required>

<input
type="number"
step="0.01"
name="price"
placeholder="Price"
required>

<input
type="text"
name="category"
placeholder="Category"
required>

<input
type="number"
name="stock"
placeholder="Stock Quantity"
required>

<input
type="file"
name="image"
required>

<br><br>

<label>Additional Images</label>

<input
type="file"
name="gallery[]"
multiple>

<textarea
name="description"
placeholder="Product Description">
</textarea>

<button
type="submit"
name="add_product">
Add Product
</button>

</form>

</section>

</body>
</html>
