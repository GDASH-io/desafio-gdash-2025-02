 = 'frontend/src/components/sections/UserManagement.tsx'
 = Get-Content -Raw 
 = '        if \(!window.confirm\(.+?\)\) \{\r?\n            return;\r?\n        \}\r?\n'
 = [regex]::new(, 'Singleline')
 = .Replace(, '')
Set-Content -Path  -Value 
