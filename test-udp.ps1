$udpClient = New-Object System.Net.Sockets.UdpClient
$randomNumber = Get-Random -Minimum 1 -Maximum 1001
$bytes = [System.Text.Encoding]::ASCII.GetBytes("100 Test message from database - Random: $randomNumber")
$udpClient.Send($bytes, $bytes.Length, "localhost", 8889)
$udpClient.Close()
Write-Host "Test message sent successfully (Random: $randomNumber)"
