import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doctorsAPI, appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, X } from 'lucide-react';

const bookingSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  reason: z.string().min(10, 'Please provide at least 10 characters for the reason'),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  email: string;
}

interface BookAppointmentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const BookAppointment: React.FC<BookAppointmentProps> = ({ onSuccess, onCancel }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDoctor = watch('doctorId');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch doctors',
        variant: 'destructive',
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const onSubmit = async (data: BookingForm) => {
    setLoading(true);
    try {
      await appointmentsAPI.create({
        doctorId: data.doctorId,
        date: data.date,
        time: data.time,
        reason: data.reason
      });
      toast({
        title: 'Success',
        description: 'Appointment booked successfully! Please wait for doctor approval.',
      });
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to book appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorInfo = doctors.find(doctor => doctor._id === selectedDoctor);

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Book Appointment
            </CardTitle>
            <CardDescription>
              Schedule an appointment with one of our doctors
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label htmlFor="doctor">Select Doctor</Label>
            {loadingDoctors ? (
              <div className="text-sm text-muted-foreground">Loading doctors...</div>
            ) : (
              <Select onValueChange={(value) => setValue('doctorId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Dr. {doctor.name}</div>
                          <div className="text-sm text-muted-foreground">{doctor.specialization}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.doctorId && (
              <p className="text-sm text-destructive">{errors.doctorId.message}</p>
            )}
          </div>

          {/* Selected Doctor Info */}
          {selectedDoctorInfo && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Dr. {selectedDoctorInfo.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedDoctorInfo.specialization}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Preferred Date</Label>
            <Input
              id="date"
              type="date"
              min={minDateString}
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time</Label>
            <Select onValueChange={(value) => setValue('time', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Textarea
              id="reason"
              placeholder="Please describe your symptoms or reason for the appointment..."
              rows={4}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading || loadingDoctors}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookAppointment;