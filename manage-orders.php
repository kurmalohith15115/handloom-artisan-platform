<?php

include "config/db.php";

$result = mysqli_query(
$conn,
"SELECT * FROM orders ORDER BY id DESC"
);

?>

<!DOCTYPE html>
<html>
<head>
    <title>Manage Orders</title>
</head>
<body>

<h1>Manage Orders</h1>

<table border="1" cellpadding="10">

<tr>
    <th>ID</th>
    <th>Customer</th>
    <th>Amount</th>
    <th>Current Status</th>
    <th>Date</th>
    <th>Update Status</th>
</tr>

<?php while($row = mysqli_fetch_assoc($result)){ ?>

<tr>

    <td><?php echo $row['id']; ?></td>

    <td><?php echo $row['customer_name']; ?></td>

    <td>₹<?php echo $row['amount']; ?></td>

    <td><?php echo $row['status']; ?></td>

    <td><?php echo $row['created_at']; ?></td>

    <td>

        <form action="update-order-status.php" method="POST">

            <input
                type="hidden"
                name="id"
                value="<?php echo $row['id']; ?>"
            >

            <select name="status">

                <option value="Pending"
                <?php if($row['status']=="Pending") echo "selected"; ?>>
                Pending
                </option>

                <option value="Processing"
                <?php if($row['status']=="Processing") echo "selected"; ?>>
                Processing
                </option>

                <option value="Shipped"
                <?php if($row['status']=="Shipped") echo "selected"; ?>>
                Shipped
                </option>

                <option value="Delivered"
                <?php if($row['status']=="Delivered") echo "selected"; ?>>
                Delivered
                </option>

                <option value="Cancelled"
                <?php if($row['status']=="Cancelled") echo "selected"; ?>>
                Cancelled
                </option>

            </select>

            <button type="submit">
                Update
            </button>

        </form>

    </td>

</tr>

<?php } ?>

</table>

</body>
</html>