import sys, re
with open('d:/Users/JMR/Documents/DOMS/GIT REPO/domspancit.github.io/tmp_script.js', 'r', encoding='utf-8') as f:
    s = f.read()

funcs = ['async function getEntries', 'async function saveEntry', 'async function ghGet', 'async function ghSave', 'function getOwnerPass', 'function changeOwnerPassword', 'function getStaffAccounts', 'function saveStaffAccounts', 'function addStaffAccount', 'function deleteStaff', 'function editStaffPin']
for func in funcs:
    idx = s.find(func)
    if idx != -1:
        end = s.find('function ', idx + 10)
        if end == -1: end = len(s)
        print('--- ' + func + ' ---')
        print(s[idx:end][:500])