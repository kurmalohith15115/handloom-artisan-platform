<?php
session_start();

if(!isset($_SESSION['admin']))
{
    header("Location: admin-login.html");
    exit();
}
?>

<h1>Admin Dashboard</h1>

<a href="manage-artisans.php">Manage Artisans</a><br><br>

<a href="manage-customers.php">Manage Customers</a><br><br>

<a href="manage-products.php">Manage Products</a><br><br>

<a href="manage-orders.php">Manage Orders</a><br><br>

<a href="admin-logout.php">Logout</a>