import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
  degree: string;
  designation?: string;
  experience?: string;
  availability_date?: string;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
  patient_limit?: number;
}

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not Set";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBookAppointment = () => {
    navigate(`/book-appointment/${doctor.id}`);
  };

  return (
    <Card className="medical-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {doctor.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{doctor.degree}</p>
        {doctor.experience && (
          <p className="text-sm text-muted-foreground">{doctor.experience}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Next availability:</span>
          <Badge variant="outline">{formatDate(doctor.availability_date)}</Badge>
        </div>
        
        {doctor.start_time && doctor.end_time && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              {formatTime(doctor.start_time)} - {formatTime(doctor.end_time)}
            </span>
          </div>
        )}
        
        {doctor.break_start && doctor.break_end && (
          <div className="text-sm text-muted-foreground">
            Break: {formatTime(doctor.break_start)} - {formatTime(doctor.break_end)}
          </div>
        )}
        
        {doctor.patient_limit && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Max Patients: {doctor.patient_limit}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleBookAppointment}
          className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
        >
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;