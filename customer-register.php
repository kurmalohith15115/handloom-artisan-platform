<?php

include "config/db.php";

$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];

$password = password_hash(
    $_POST['password'],
    PASSWORD_DEFAULT
);

$sql = "INSERT INTO customers
(
name,
email,
phone,
password
)
VALUES
(
'$name',
'$email',
'$phone',
'$password'
)";

if($conn->query($sql))
{
    echo "
    <script>
    alert('Registration Successful');
    window.location.href='customer-login.html';
    </script>
    ";
}
else
{
    echo $conn->error;
}

?>