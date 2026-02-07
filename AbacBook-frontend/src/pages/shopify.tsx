import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Store, Key, RefreshCw, AlertCircle, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: number;
  order_number: number;
  name: string;
  email: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  line_items: {
    id: number;
    title: string;
    quantity: number;
    price: string;
    variant_title: string | null;
  }[];
  shipping_address?: {
    name: string;
    address1: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const Shopify = () => {
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!storeUrl || !accessToken) {
      toast({
        title: "Missing credentials",
        description: "Please enter both store URL and access token",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Clean up store URL
      let cleanUrl = storeUrl.trim();
      if (!cleanUrl.includes(".myshopify.com")) {
        cleanUrl = `${cleanUrl}.myshopify.com`;
      }
      cleanUrl = cleanUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

      const response = await fetch(
        `https://${cleanUrl}/admin/api/2024-01/orders.json?status=any&limit=50`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setConnected(true);
      toast({
        title: "Connected!",
        description: `Found ${data.orders?.length || 0} orders`,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Connection failed",
        description: "Check your store URL and access token. Make sure CORS is enabled.",
        variant: "destructive",
      });
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (financialStatus: string, fulfillmentStatus: string | null) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      paid: { color: "bg-accent text-accent-foreground", icon: <CheckCircle2 className="w-3 h-3" /> },
      pending: { color: "bg-muted text-muted-foreground", icon: <Clock className="w-3 h-3" /> },
      refunded: { color: "bg-destructive text-destructive-foreground", icon: <XCircle className="w-3 h-3" /> },
      fulfilled: { color: "bg-accent text-accent-foreground", icon: <Truck className="w-3 h-3" /> },
      unfulfilled: { color: "bg-muted text-muted-foreground", icon: <Package className="w-3 h-3" /> },
    };

    return (
      <div className="flex gap-2">
        <Badge className={`${statusConfig[financialStatus]?.color || "bg-secondary"} flex items-center gap-1`}>
          {statusConfig[financialStatus]?.icon}
          {financialStatus}
        </Badge>
        <Badge className={`${statusConfig[fulfillmentStatus || "unfulfilled"]?.color || "bg-secondary"} flex items-center gap-1`}>
          {statusConfig[fulfillmentStatus || "unfulfilled"]?.icon}
          {fulfillmentStatus || "unfulfilled"}
        </Badge>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Shopify Order Tracker</h1>
              <p className="text-primary-foreground/80 text-sm">View and manage your store orders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Connection Card */}
        <Card className="mb-8 border-border shadow-lg">
          <CardHeader className="bg-card">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Key className="w-5 h-5" />
              Connect Your Store
            </CardTitle>
            <CardDescription>
              Enter your Shopify store credentials to fetch orders
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeUrl">Store URL</Label>
                <Input
                  id="storeUrl"
                  placeholder="your-store.myshopify.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="bg-background border-input"
                />
                <p className="text-xs text-muted-foreground">
                  Enter just the store name or full URL
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Admin API Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="shpat_xxxxxxxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="bg-background border-input"
                />
                <p className="text-xs text-muted-foreground">
                  Found in Settings → Apps → Develop apps
                </p>
              </div>
            </div>
            <Button
              onClick={fetchOrders}
              disabled={loading}
              className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 mr-2" />
                  {connected ? "Refresh Orders" : "Connect & Fetch Orders"}
                </>
              )}
            </Button>

            {connected && (
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Connected to store</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5" />
              Orders ({orders.length})
            </h2>

            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-border shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          Order {order.name}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.financial_status, order.fulfillment_status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Customer</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {order.customer && (
                            <p>{order.customer.first_name} {order.customer.last_name}</p>
                          )}
                          <p>{order.email}</p>
                          {order.shipping_address && (
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <p className="font-medium text-foreground mb-1">Shipping Address:</p>
                              <p>{order.shipping_address.name}</p>
                              <p>{order.shipping_address.address1}</p>
                              <p>
                                {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.zip}
                              </p>
                              <p>{order.shipping_address.country}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Items</h4>
                        <div className="space-y-2">
                          {order.line_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-start p-3 bg-muted rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-foreground">{item.title}</p>
                                {item.variant_title && (
                                  <p className="text-sm text-muted-foreground">{item.variant_title}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium text-foreground">
                                {order.currency} {item.price}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="text-xl font-bold text-primary">
                            {order.currency} {order.total_price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : connected ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No orders found</h3>
              <p className="text-muted-foreground">Your store doesn't have any orders yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Connect your store</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter your Shopify store URL and Admin API access token above to view your orders.
                You can find your access token in your Shopify admin under Settings → Apps → Develop apps.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Shopify;
