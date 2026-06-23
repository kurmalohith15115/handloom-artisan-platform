<?php

session_start();

session_destroy();

header(
"Location: customer-login.html"
);

?>