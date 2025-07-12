import s from "./Form.module.css";
import React from "react";
import SuggestedInput from "./SuggestedInput/SuggestedInput";

interface FormProps {
  onSubmit: (games: string[]) => void;
  isLoading?: boolean;
}

const Form: React.FC<FormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = React.useState<{
    game1: string;
    game2: string;
    game3: string;
  }>({
    game1: "",
    game2: "",
    game3: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const games = [formData.game1, formData.game2, formData.game3];
    const validGames = games.filter((game) => game.trim() !== "");

    if (validGames.length === 3) {
      onSubmit(validGames);
    }
  };

  const handleReset = () => {
    setFormData({
      game1: "",
      game2: "",
      game3: "",
    });
  };

  const isValid =
    [formData.game1, formData.game2, formData.game3].filter(
      (game) => game.trim() !== ""
    ).length === 3;

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.header}>
        <h1 className={s.title}>
          GameRec: Rekomendasi Game sesuai preferensi kamu!
        </h1>
        <p className={s.desc}>
          Mulai dari 3 game yang kamu sukai, kami akan memberikan rekomendasi
          game yang sesuai dengan preferensi kamu!
        </p>
      </div>
      <div className={s.inputGroup}>
        <SuggestedInput
          key="game1"
          value={formData.game1}
          name="game1"
          onChange={handleInputChange}
          placeholder="Mulai dengan nama game pertama..."
          disabled={isLoading}
        />
        <SuggestedInput
          key="game2"
          value={formData.game2}
          name="game2"
          onChange={handleInputChange}
          placeholder="Masukkannama game kedua..."
          disabled={isLoading}
        />
        <SuggestedInput
          key="game3"
          value={formData.game3}
          name="game3"
          onChange={handleInputChange}
          placeholder="Masukkan nama game ketiga..."
          disabled={isLoading}
        />
        <div className={s.buttonContainer}>
          <button
            type="submit"
            className={s.submitButton}
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Processing..." : "Submit"}
          </button>
          <button
            type="button"
            className={s.resetButton}
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
};

export default Form;
