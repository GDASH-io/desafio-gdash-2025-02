export function formatDate(data: any) {
    const dateUtc = new Date(data + 'Z');  
    const dateString = dateUtc.toLocaleDateString('pt-BR');
    const timeString = dateUtc.toLocaleTimeString('pt-BR');

    return `${dateString} - ${timeString}`
  }