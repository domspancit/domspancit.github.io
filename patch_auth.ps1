$content = [System.IO.File]::ReadAllText("d:\Users\JMR\Documents\DOMS\GIT REPO\domspancit.github.io\index.html")

$content = [regex]::Replace($content,
  'function\s+doLogin\(\)\s*\{\s*const\s+isOwner\s*=\s*document\.getElementById\(''role-owner''\)\.checked;\s*const\s+pin\s*=\s*document\.getElementById\(''login-pin''\)\.value;\s*const\s+err\s*=\s*document\.getElementById\(''login-err''\);\s*if\(!pin\)\s*\{\s*err\.textContent=''Enter PIN'';err\.style\.display=''block'';return;\s*\}',
  "async function doLogin(){
  const isOwner=document.getElementById('role-owner').checked;
  const pin=document.getElementById('login-pin').value;
  const err=document.getElementById('login-err');
  if(!pin){err.textContent='Enter PIN';err.style.display='block';return;}
  err.textContent='Verifying...';err.style.display='block';
  const ghData = await ghGet();
  if(ghData){
    if(ghData.ownerPass) localStorage.setItem('doms_owner_pass', ghData.ownerPass);
    if(ghData.staffAccounts) localStorage.setItem('doms_staff_accounts', JSON.stringify(ghData.staffAccounts));
  }
")

$content = [regex]::Replace($content,
  'function\s+changeOwnerPassword\(\)\{\s*const\s+newPass=document\.getElementById\(''new-owner-pass''\)\.value;\s*if\(newPass\.trim\(\)\.length<4\)\{alert\(''Password must be at least 4 chars\.''\);return;\}\s*localStorage\.setItem\(''doms_owner_pass'',newPass\.trim\(\)\);\s*alert\(''Password changed successfully\.''\);\s*document\.getElementById\(''new-owner-pass''\)\.value='''';\s*\}',
  "async function changeOwnerPassword(){
  const newPass=document.getElementById('new-owner-pass').value.trim();
  if(newPass.length<4){alert('Password must be at least 4 chars.');return;}
  showSaving(true);
  const d = await ghGet() || { entries: [] };
  d.ownerPass = newPass;
  const ok = await ghSave(d);
  showSaving(false);
  if(ok){
    localStorage.setItem('doms_owner_pass',newPass);
    alert('Password changed and synced successfully.');
    document.getElementById('new-owner-pass').value='';
  } else {
    alert('Failed to sync password to GitHub.');
  }
}")

$content = [regex]::Replace($content,
  'function\s+saveStaffAccounts\(list\)\{\s*localStorage\.setItem\(''doms_staff_accounts'',JSON\.stringify\(list\)\);\s*\}',
  "async function saveStaffAccounts(list){
  showSaving(true);
  const d = await ghGet() || { entries: [] };
  d.staffAccounts = list;
  const ok = await ghSave(d);
  showSaving(false);
  if(ok) {
    localStorage.setItem('doms_staff_accounts',JSON.stringify(list));
    return true;
  }
  return false;
}")

$content = [regex]::Replace($content,
  'function\s+addStaffAccount\(\)\{\s*const\s+branch=document\.getElementById\(''new-staff-branch''\)\.value;\s*const\s+name=document\.getElementById\(''new-staff-name''\)\.value;\s*const\s+pin=document\.getElementById\(''new-staff-pin''\)\.value;\s*if\(!branch\|\|!name\|\|!pin\)\{alert\(''Fill all fields\.''\);return;\}\s*const\s+list=getStaffAccounts\(\);\s*if\(list\.find\(a=>a\.name===name&&a\.branch===branch\)\)\{alert\(''Staff already exists in this branch\.''\);return;\}\s*list\.push\(\{branch,name,pin\}\);\s*saveStaffAccounts\(list\);\s*renderStaffAccounts\(\);\s*hideAddStaff\(\);\s*\}',
  "async function addStaffAccount(){
  const branch=document.getElementById('new-staff-branch').value;
  const name=document.getElementById('new-staff-name').value;
  const pin=document.getElementById('new-staff-pin').value;
  if(!branch||!name||!pin){alert('Fill all fields.');return;}
  const list=getStaffAccounts();
  if(list.find(a=>a.name===name&&a.branch===branch)){alert('Staff already exists in this branch.');return;}
  list.push({branch,name,pin});
  const ok = await saveStaffAccounts(list);
  if(ok) {
    renderStaffAccounts();
    hideAddStaff();
  } else {
    alert('Failed to sync staff account.');
  }
}")

$content = [regex]::Replace($content,
  'function\s+deleteStaff\(idx\)\{\s*if\(!confirm\(''Delete this staff\?''\)\)return;\s*const\s+list=getStaffAccounts\(\);\s*list\.splice\(idx,1\);\s*saveStaffAccounts\(list\);\s*renderStaffAccounts\(\);\s*\}',
  "async function deleteStaff(idx){
  if(!confirm('Delete this staff?'))return;
  const list=getStaffAccounts();
  list.splice(idx,1);
  const ok = await saveStaffAccounts(list);
  if(ok) renderStaffAccounts();
  else alert('Failed to delete staff account.');
}")

$content = [regex]::Replace($content,
  'function\s+editStaffPin\(idx\)\{\s*const\s+list=getStaffAccounts\(\);\s*const\s+newPin=prompt\(''Enter new PIN for ''\+list\[idx\]\.name\+'':'',list\[idx\]\.pin\);\s*if\(newPin===null\)return;\s*if\(newPin\.trim\(\)\.length<4\)\{alert\(''PIN must be at least 4 digits\.''\);return;\}\s*list\[idx\]\.pin=newPin\.trim\(\);\s*saveStaffAccounts\(list\);\s*renderStaffAccounts\(\);\s*\}',
  "async function editStaffPin(idx){
  const list=getStaffAccounts();
  const newPin=prompt('Enter new PIN for '+list[idx].name+':',list[idx].pin);
  if(newPin===null)return;
  if(newPin.trim().length<4){alert('PIN must be at least 4 digits.');return;}
  list[idx].pin=newPin.trim();
  const ok = await saveStaffAccounts(list);
  if(ok) renderStaffAccounts();
  else alert('Failed to sync updated PIN.');
}")

[System.IO.File]::WriteAllText("d:\Users\JMR\Documents\DOMS\GIT REPO\domspancit.github.io\index.html", $content)
