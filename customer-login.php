<?php

session_start();

include "config/db.php";

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM customers
WHERE email='$email'";

$result = mysqli_query($conn,$sql);

if(mysqli_num_rows($result)==1)
{
    $customer = mysqli_fetch_assoc($result);

    if(password_verify(
        $password,
        $customer['password']
    ))
    {
        $_SESSION['customer_id']
        = $customer['id'];

        $_SESSION['customer_name']
        = $customer['name'];

        header(
        "Location: customer-dashboard.php"
        );

        exit();
    }
    else
    {
        echo "Wrong Password";
    }
}
else
{
    echo "Customer Not Found";
}

?>