import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showLogin?: boolean;
  doctorInfo?: {
    name: string;
    degree: string;
    designation: string;
    experience: string;
  };
}

const Header = ({ showLogin = true, doctorInfo }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-card shadow-soft border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left side - Logo/Brand */}
        <div className="flex flex-col">
          <h1 className="text-primary font-bold text-2xl font-bengali">অন্যরকম</h1>
          <p className="text-sm font-bengali" style={{ color: '#282828' }}>হিলিং সার্ভিসেস</p>
        </div>

        {/* Right side - Login or Doctor Info */}
        <div className="flex items-center">
          {doctorInfo ? (
            <div className="text-right">
              <h2 className="text-foreground font-semibold" style={{ fontSize: '1.7rem' }}>
                {doctorInfo.name}
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{doctorInfo.degree}</p>
                <p>{doctorInfo.designation}</p>
                <p>{doctorInfo.experience}</p>
              </div>
            </div>
          ) : showLogin ? (
            <Button 
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-glow text-primary-foreground"
            >
              Login
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;