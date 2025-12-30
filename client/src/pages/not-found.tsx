import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md mx-4 rounded-3xl shadow-xl">
        <CardContent className="pt-6 text-center space-y-6 p-10">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-orange-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            404 Page Not Found
          </h1>
          <p className="text-gray-500 text-lg">
            Oops! It looks like this page took a nap. 😴
          </p>
          <Link href="/">
            <Button className="w-full h-12 text-lg rounded-xl mt-4 bg-primary hover:bg-primary/90">
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
