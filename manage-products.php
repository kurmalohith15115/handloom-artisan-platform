<?php

include "config/db.php";

$result =
mysqli_query(
$conn,
"SELECT * FROM products ORDER BY id DESC"
);

?>

<h1>Manage Products</h1>

<table border="1">

<tr>
<th>ID</th>
<th>Name</th>
<th>Price</th>
<th>Stock</th>
<th>Action</th>
</tr>

<?php
while($row=mysqli_fetch_assoc($result))
{
?>
<tr>

<td><?php echo $row['id']; ?></td>

<td><?php echo $row['product_name']; ?></td>

<td><?php echo $row['price']; ?></td>

<td><?php echo $row['stock']; ?></td>

<td>

<a href="edit-product.php?id=<?php echo $row['id']; ?>">
Edit
</a>

|

<a href="delete-product.php?id=<?php echo $row['id']; ?>">
Delete
</a>

</td>

</tr>

<?php } ?>

</table>