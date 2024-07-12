import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight, Calendar, MapPin, Settings2, X } from "lucide-react";
import { Button } from "../../../components/button";
import { DateRange, DayPicker } from "react-day-picker";
import { format } from 'date-fns';
import "react-day-picker/dist/style.css";

interface DestinationAndDateStepProps {
  isGuestsInputOpen: boolean;
  eventStartAndEndDates: DateRange | undefined;
  closeGuestsInput: () => void;
  openGuestsInput: () => void;
  setDestination: (destination: string) => void;
  setEventStartAndEndDates: (dates: DateRange | undefined) => void;
}

interface Suggestion {
  id: string;
  place_name: string;
}

export function DestinationAndDateStep({
  closeGuestsInput,
  isGuestsInputOpen,
  openGuestsInput,
  setDestination,
  setEventStartAndEndDates,
  eventStartAndEndDates,
}: DestinationAndDateStepProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const OPENCAGE_API_KEY = "e2a0055230734e90bd3a27d304c8a6ec";

  useEffect(() => {
    if (query.length > 2) {
      axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${OPENCAGE_API_KEY}&limit=5`)
        .then(response => {
          const fetchedSuggestions = response.data.results.map((result: any) => ({
            id: result.annotations.geohash,
            place_name: result.formatted,
          }));
          setSuggestions(fetchedSuggestions);
        })
        .catch(error => {
          console.error("Error fetching data from OpenCage API:", error);
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  function openDatePicker() {
    setIsDatePickerOpen(true);
  }

  function closeDatePicker() {
    setIsDatePickerOpen(false);
  }

  const displayedDate = eventStartAndEndDates && eventStartAndEndDates.from && eventStartAndEndDates.to
    ? format(eventStartAndEndDates.from, "d' de 'LLL").concat(' até ').concat(format(eventStartAndEndDates.to, "d' de 'LLL"))
    : null;

  return (
    <div className="h-16 bg-zinc-900 px-4 rounded-xl flex items-center shadow-shape gap-3 ">
      <div className="flex items-center gap-2 flex-1 relative">
        <MapPin className='size-5 text-zinc-400' />
        <input
          disabled={isGuestsInputOpen}
          type="text"
          placeholder="Para onde você vai?"
          className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 w-full bg-white text-black rounded-md shadow-lg">
            {suggestions.map(suggestion => (
              <li
                key={suggestion.id}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setDestination(suggestion.place_name);
                  setQuery(suggestion.place_name);
                  setSuggestions([]);
                }}
              >
                {suggestion.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={openDatePicker} disabled={isGuestsInputOpen} className="flex items-center gap-2 text-left w-[240px]">
        <Calendar className='size-5 text-zinc-400' />
        <span className=" text-lg text-zinc-400 w-40 flex-1" >
          {displayedDate || 'Quando?'}
        </span>
      </button>

      {isDatePickerOpen && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center'>
          <div className='rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Selecione a data</h2>
                <button type="button" onClick={closeDatePicker}>
                  <X className='size-5 text-zinc-400' />
                </button>
              </div>
            </div>

            <DayPicker mode="range" selected={eventStartAndEndDates} onSelect={setEventStartAndEndDates} />
          </div>
        </div>
      )}

      <div className='w-px h-6 bg-zinc-800' />

      {isGuestsInputOpen ? (
        <Button onClick={closeGuestsInput} variant="secondary">
          Alterar local/data
          <Settings2 className='size-5' />
        </Button>
      ) : (
        <Button onClick={openGuestsInput} variant="primary">
          Continuar
          <ArrowRight className='size-5' />
        </Button>
      )}
    </div>
  );
}
