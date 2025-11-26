
import { Layout } from "../../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

function Dashboard() {
    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Visão Geral</h1>
                    <p className="text-sm text-gray-500">Clima Campina Grande</p>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Temperatura Atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">-- °C</div>
                            <p className="text-xs text-gray-500">Atualiza com dados ingeridos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Umidade</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">-- %</div>
                            <p className="text-xs text-gray-500">Última leitura</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">-- km/h</div>
                            <p className="text-xs text-gray-500">Direção e rajadas</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

export default Dashboard;