import { useState } from 'react'
import { useSwapi } from '@/hooks/useSwapi'
import { ExplorerHeader } from '@/components/explorer/ExplorerHeader' 
import { PaginationControls } from '@/components/explorer/PaginationControls' 
import { CategorySelector } from '@/components/explorer/CategorySelector'
import { ResourceCard } from '@/components/explorer/ResourceCard' 
import { SideBar } from '@/components/SideBar'

export const Explorer = () => {
  const [category, setCategory] = useState('people');
  const { data, loading, page, setPage } = useSwapi(category);

  return (
    <div className="min-h-screen flex bg-background text-foreground dark:bg-black dark:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22black%22/><circle cx=%2220%22 cy=%2220%22 r=%221%22 fill=%22white%22 opacity=%220.7%22/><circle cx=%2260%22 cy=%2240%22 r=%221%22 fill=%22white%22 opacity=%220.5%22/><circle cx=%2280%22 cy=%2270%22 r=%221%22 fill=%22white%22 opacity=%220.9%22/><circle cx=%2240%22 cy=%2280%22 r=%221%22 fill=%22white%22 opacity=%220.6%22/></svg>')]">
      
      <SideBar/>
      
      <main className="flex-1 p-8 overflow-auto">
        
        <ExplorerHeader />
        
        <CategorySelector current={category} onChange={setCategory} />
        
        <div className="min-h-[400px] mt-8">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="text-xl text-muted-foreground">Carregando dados da galáxia...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data?.results?.map((item: any, index: number) => (
                        <ResourceCard 
                            key={item.url || index} 
                            item={item} 
                            category={category} 
                        />
                    ))}
                </div>
            )}

            {!loading && data?.results?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    Nenhum registro encontrado.
                </div>
            )}
        </div>
        
        <PaginationControls 
            page={page} 
            loading={loading} 
            hasNext={!!data?.next} 
            setPage={setPage} 
        />
        
      </main>
    </div>
  )
}
