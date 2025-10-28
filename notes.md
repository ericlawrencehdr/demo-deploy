# Server Deployment notes

## Elevating permissions

actions.runner.ericlawrencehdr-demo-deploy.OMAPI-SDPXLGN02-deploy

``` powershell
sc sdshow "actions.runner.ericlawrencehdr-demo-deploy.OMAPI-SDPXLGN02-deploy"
```


```powershell
# Run this in PowerShell as Administrator
# Replace "YOUR_RUNNER_USER" with the actual username running the GitHub Actions runner

sc sdset demo-deploy "D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;IU)(A;;CCLCSWLOCRRC;;;SU)(A;;RPWPCR;;;S-1-5-YOUR-USER-SID)"

sc sdset demo-deploy "D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;IU)(A;;CCLCSWLOCRRC;;;SU)(A;;RPWPCR;;;S-1-5-YOUR-USER-SID)"
```

```powershell
# grand service perms?

# Run as Administrator - one time
$serviceName = "demo-deploy"
$permission = "GenericRead,GenericExecute,ReadControl,QueryConfig,QueryStatus,Start,Stop"

# This requires the Carbon PowerShell module
Install-Module -Name Carbon -Scope AllUsers -Force
Import-Module Carbon

Grant-CServicePermission -Name $serviceName -Identity "YOUR_RUNNER_USER" -StartService -StopService

```

```powershell
# MODIFIED to not use carbon
# Run as Administrator
$serviceName = "demo-deploy"
$runnerUser = "NT AUTHORITY\SYSTEM"  # Change this after checking

Write-Host "Granting service permissions to: $runnerUser"

# Get the user's SID
try {
    $objUser = New-Object System.Security.Principal.NTAccount($runnerUser)
    $sid = $objUser.Translate([System.Security.Principal.SecurityIdentifier]).Value
    Write-Host "User SID: $sid"
} catch {
    Write-Host "Error: Could not find user '$runnerUser'"
    Write-Host "Make sure the username is correct and the user exists on this system"
    exit 1
}

# Get current security descriptor
$currentSDDL = (sc.exe sdshow $serviceName)[1]
Write-Host "Current SDDL: $currentSDDL"

# Add permissions: RPWP = Start/Stop service, LC = Query Status
$newACE = "(A;;RPWPLC;;;$sid)"

# Insert the new ACE into the DACL
if ($currentSDDL -match '^(D:\(.*?\))+(S:.*)?$') {
    if ($currentSDDL -match '^(D:.+?)(S:.*)$') {
        $newSDDL = $matches[1] + $newACE + $matches[2]
    } else {
        $newSDDL = $currentSDDL + $newACE
    }
} else {
    Write-Host "Error: Could not parse SDDL"
    exit 1
}

Write-Host "New SDDL: $newSDDL"

# Apply the new security descriptor
$result = sc.exe sdset $serviceName $newSDDL

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Permissions granted to $runnerUser for service $serviceName"
    Write-Host "The user can now start and stop the service."
} else {
    Write-Host "ERROR: Failed to set permissions"
    Write-Host $result
}

```