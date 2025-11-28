import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from './combobox';

const OPTIONS = [
    { label: 'Todas as cidades', value: 'all' },
    { label: 'Aracaju', value: 'aracaju' },
    { label: 'Guarulhos', value: 'guarulhos' }
];

describe('Combobox', () => {
    it('mantém todas as opções visíveis independentemente do valor selecionado', async () => {
        const onChange = vi.fn();
        render(<Combobox value="guarulhos" onChange={onChange} options={OPTIONS} placeholder="Selecione..." />);

        await userEvent.click(screen.getByRole('combobox'));

        OPTIONS.forEach((opt) => {
            const matches = screen.getAllByRole('option', { name: opt.label });
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    it('dispara onChange com o valor escolhido ao selecionar uma nova opção', async () => {
        const onChange = vi.fn();
        render(<Combobox value="all" onChange={onChange} options={OPTIONS} placeholder="Selecione..." />);

        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(screen.getByText('Aracaju'));

        expect(onChange).toHaveBeenCalledWith('aracaju');
    });
});
