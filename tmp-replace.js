const fs = require('fs');
const path = 'frontend/src/components/sections/UserManagement.tsx';
let content = fs.readFileSync(path, 'utf8');
const startKey = '    const handleDelete = async (user: UserRow) => {';
const start = content.indexOf(startKey);
if (start === -1) throw new Error('start not found');
const endKey = '    const formatDate = (value?: string) => {';
const end = content.indexOf(endKey, start);
if (end === -1) throw new Error('end not found');
const replacement =     const handleDelete = (user: UserRow) => {
        if (!user._id) {
            notify('Usuário inválido', 'error');
            return;
        }
        setPendingDelete(user);
        setAlertOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete?._id) {
            setAlertOpen(false);
            return;
        }
        try {
            await deleteUser(pendingDelete._id);
            notify('Usuário removido', 'success');
            if (selectedUser?._id === pendingDelete._id) {
                resetForm();
            }
        } catch {
            notify('Não foi possível remover o usuário', 'error');
        } finally {
            setAlertOpen(false);
            setPendingDelete(null);
        }
    };
;
content = content.slice(0, start) + replacement + content.slice(end);
fs.writeFileSync(path, content, 'utf8');
