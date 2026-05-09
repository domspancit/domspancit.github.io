$s = [System.IO.File]::ReadAllText('d:\Users\JMR\Documents\DOMS\GIT REPO\domspancit.github.io\index.html')

$funcs = @('async function getEntries', 'async function saveEntry', 'async function ghGet', 'async function ghSave', 'function getOwnerPass', 'function changeOwnerPassword', 'function getStaffAccounts', 'function saveStaffAccounts', 'function addStaffAccount', 'function deleteStaff', 'function editStaffPin', 'function doLogin')
foreach($f in $funcs) {
    $idx = $s.IndexOf($f)
    if($idx -ne -1) {
        $end = $s.IndexOf('function', $idx + 10)
        if($end -eq -1) { $end = $s.Length }
        Write-Host "--- $f ---"
        Write-Host $s.Substring($idx, $end - $idx)
    }
}