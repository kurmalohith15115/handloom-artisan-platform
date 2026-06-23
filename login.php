<?php

session_start();

include "config/db.php";

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM artisans
WHERE email='$email'";

$result = mysqli_query($conn,$sql);

if(mysqli_num_rows($result)==1)
{
    $artisan = mysqli_fetch_assoc($result);

    if(password_verify($password,$artisan['password']))
    {
        $_SESSION['artisan_id'] = $artisan['id'];

        $_SESSION['artisan_name'] = $artisan['name'];

        header("Location: dashboard.php");
        exit();
    }
    else
    {
        echo "Wrong Password";
    }
}
else
{
    echo "Email Not Found";
}

?>