 = 'frontend/src/components/sections/UserManagement.tsx'
 = Get-Content -Raw 
 = '        if (!window.confirm(Remover usuorio ?)) {
            return;
        }
'
 = .IndexOf()
if ( -ge 0) {
     = .Remove(, .Length)
}
Set-Content -Path  -Value 
