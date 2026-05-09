$s = [System.IO.File]::ReadAllText('d:\Users\JMR\Documents\DOMS\GIT REPO\domspancit.github.io\index.html')
$ex = [System.IO.File]::ReadAllText('d:\Users\JMR\Documents\DOMS\GIT REPO\domspancit.github.io\extract2.out')

function GetOld($fnStart) {
    $start = $ex.IndexOf("--- $fnStart ---")
    if($start -ge 0) {
        $start += "--- $fnStart ---
".Length # or 

        # Account for possible \r\n
        if($ex[$start-1] -eq "") { $start++ }
        if($ex[$start] -eq "
") { $start++ }

        $end = $ex.IndexOf("--- ", $start)
        if($end -lt 0) { $end = $ex.Length }
        # Strip trailing newlines
        while($end -gt $start -and ($ex[$end-1] -eq "
" -or $ex[$end-1] -eq "")) {
            $end--
        }
        return $ex.Substring($start, $end - $start)
    }
    return ""
}

$o1 = GetOld 'function doLogin'
# Remove the last trailing '}' and any newlines since extract2.out stopped at the next 'function' which might be before the closing brace...
# WAIT! extract2.out extracted until the NEXT function string. It might have included extra trailing garbage but it's an exact substring of the file!
# Therefore, replacing $o1 with $newCode + (any trailing garbage) is totally safe!

$n1 = "async function doLogin(){
  const isOwner=document.querySelectorAll('.role-tab')[1].classList.contains('active');
  const err=document.getElementById('login-err');
  err.style.display='none';
  err.textContent='Verifying...';err.style.display='block';
  const gh = await ghGet();
  if(gh && gh.data){
    if(gh.data.ownerPass) localStorage.setItem('doms_owner_pass', gh.data.ownerPass);
    if(gh.data.staffAccounts) localStorage.setItem('doms_staff_accounts', JSON.stringify(gh.data.staffAccounts));
  }
  err.style.display='none';
  err.textContent='';
  if(isOwner){
    if(document.getElementById('owner-pass').value===getOwnerPass()){
      saveSession('owner',null,null);
      resetInactivityTimer();
      showScreen('screen-owner');initOwnerDashboard();
    }
    else{err.textContent='Incorrect password.';err.style.display='block';}
  } else {
    const username=(document.getElementById('staff-username').value||'').trim();
    const pin=document.getElementById('staff-pin').value;
    if(!username){err.textContent='Please enter your username.';err.style.display='block';return;}
    if(!pin){err.textContent='Please enter your PIN.';err.style.display='block';return;}
    const accounts=getStaffAccounts();
    const account=accounts.find(a=>a.username.toLowerCase()===username.toLowerCase()&&a.pin===pin);
    if(account){
      currentBranch=account.branch;
      currentStaff=account.username;
      saveSession('staff',account.branch,account.username);
      resetInactivityTimer();
      document.getElementById('staff-branch-label').textContent=account.branch;
      document.getElementById('staff-date-label').textContent=new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
      showScreen('screen-staff');initStaffForm();
    } else {err.textContent='Incorrect username or PIN.';err.style.display='block';}
  }
}"
if($o1) { $s = $s.Replace($o1, $n1) ; Write-Host "Replaced doLogin" }


$o2 = GetOld 'function changeOwnerPassword'
$n2 = "async function changeOwnerPassword(){
  const old=document.getElementById('set-old-pass').value;
  const nw=document.getElementById('set-new-pass').value;
  const cf=document.getElementById('set-confirm-pass').value;
  const err=document.getElementById('pass-err');
  const ok=document.getElementById('pass-ok');
  err.style.display='none'; ok.style.display='none';
  const storedPass=localStorage.getItem('doms_owner_pass')||OWNER_PASS;
  if(old!==storedPass){err.textContent='Current password is incorrect.';err.style.display='block';return;}
  if(nw.length<4){err.textContent='New password must be at least 4 characters.';err.style.display='block';return;}
  if(nw!==cf){err.textContent='New passwords do not match.';err.style.display='block';return;}
  showSaving(true);
  const gh = await ghGet();
  let d = gh.data || { entries: [] };
  d.ownerPass = nw;
  const success = await ghSave(d);
  showSaving(false);
  if(success){
    localStorage.setItem('doms_owner_pass',nw);
    document.getElementById('set-old-pass').value='';
    document.getElementById('set-new-pass').value='';
    document.getElementById('set-confirm-pass').value='';
    ok.style.display='block';
  } else {
    err.textContent='Failed to sync password to GitHub.';err.style.display='block';
  }
}"
if($o2) { $s = $s.Replace($o2, $n2) ; Write-Host "Replaced changeOwnerPassword" }


$o3 = GetOld 'function saveStaffAccounts'
$n3 = "async function saveStaffAccounts(list){
  showSaving(true);
  const gh = await ghGet();
  let d = gh.data || { entries: [] };
  d.staffAccounts = list;
  const success = await ghSave(d);
  showSaving(false);
  if(success) {
    localStorage.setItem('doms_staff_accounts',JSON.stringify(list));
    return true;
  }
  return false;
}"
if($o3) { $s = $s.Replace($o3, $n3) ; Write-Host "Replaced saveStaffAccounts" }


$o4 = GetOld 'function addStaffAccount'
$n4 = "async function addStaffAccount(){
  const name=(document.getElementById('new-staff-name').value||'').trim();
  const pin=document.getElementById('new-staff-pin').value.trim();
  const branch=document.getElementById('new-staff-branch').value;
  const err=document.getElementById('add-staff-err');
  err.style.display='none';
  if(!name){err.textContent='Username is required.';err.style.display='block';return;}
  if(pin.length<4){err.textContent='PIN must be 4-6 digits.';err.style.display='block';return;}
  if(!branch){err.textContent='Please select a branch.';err.style.display='block';return;}
  const list=getStaffAccounts();
  if(list.find(a=>a.username.toLowerCase()===name.toLowerCase())){
    err.textContent='Username already exists.';err.style.display='block';return;
  }
  list.push({username:name,pin,branch});
  const ok = await saveStaffAccounts(list);
  if(ok){
    hideAddStaff();
    renderStaffAccounts();
  } else {
    err.textContent='Failed to sync to GitHub.';err.style.display='block';
  }
}"
if($o4) { $s = $s.Replace($o4, $n4) ; Write-Host "Replaced addStaffAccount" }


$o5 = GetOld 'function deleteStaff'
$n5 = "async function deleteStaff(i){
  if(!confirm('Remove this staff account?')) return;
  const list=getStaffAccounts();
  list.splice(i,1);
  const ok = await saveStaffAccounts(list);
  if(ok) renderStaffAccounts();
  else alert('Failed to sync deletion.');
}"
if($o5) { $s = $s.Replace($o5, $n5) ; Write-Host "Replaced deleteStaff" }


$o6 = GetOld 'function editStaffPin'
$n6 = "async function editStaffPin(i){
  const list=getStaffAccounts();
  const newPin=prompt('New PIN for ' + list[i].username + ':');
  if(!newPin) return;
  if(newPin.length<4){alert('PIN must be at least 4 digits.');return;}
  list[i].pin=newPin.trim();
  const ok = await saveStaffAccounts(list);
  if(ok) renderStaffAccounts();
  else alert('Failed to sync updated PIN.');
}
"
if($o6) { $s = $s.Replace($o6, $n6) ; Write-Host "Replaced editStaffPin" }


[System.IO.File]::WriteAllText('d:\Users\JMR\Documents\DOMS\GIT REPO\domspancit.github.io\index.html', $s)