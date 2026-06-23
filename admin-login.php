<?php

session_start();

include "config/db.php";

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM admins WHERE username='$username'";

$result = mysqli_query($conn, $sql);

if(mysqli_num_rows($result) == 1)
{
    $admin = mysqli_fetch_assoc($result);

    if(password_verify($password, $admin['password']))
    {
        $_SESSION['admin'] = $admin['username'];

        header("Location: admin-dashboard.php");
        exit();
    }
    else
    {
        echo "<h2>Wrong Password</h2>";
    }
}
else
{
    echo "<h2>Admin Not Found</h2>";
}

?>
