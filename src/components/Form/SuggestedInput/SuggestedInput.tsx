import s from "./SuggestedInput.module.css";
import React, { DetailedHTMLProps, InputHTMLAttributes, useEffect, useRef } from "react";

interface SuggestedInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  placeholder?: string;
  disabled?: boolean;
}

const SuggestedInput: React.FC<SuggestedInputProps> = (props) => {
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions from API
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/retrieve-game-name-suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Call original onChange if provided
    if (props.onChange) {
      props.onChange(e);
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for API call
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (props.value && typeof props.value === 'string' && props.value.length >= 2) {
      fetchSuggestions(props.value);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Create a synthetic event to trigger onChange
    const syntheticEvent = {
      target: {
        name: props.name,
        value: suggestion,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    if (props.onChange) {
      props.onChange(syntheticEvent);
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={s.container}>
      <input
        {...props}
        ref={inputRef}
        className={s.input}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        autoComplete="off"
      />
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className={s.suggestions}>
          {isLoading ? (
            <div className={s.loading}>Loading...</div>
          ) : (
            <ul className={s.list}>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className={s.item}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className={s.name}>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestedInput;
