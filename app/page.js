"use client";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Head from "next/head";
import Ludzik from "./components/Ludzik";

export default function Home() {
  const [scores, setScores] = useState([]);
  const [median, setMedian] = useState(0);
  const [highestScore, setHighestScore] = useState(0);

  const ScoreSchema = Yup.object().shape({
    player: Yup.string()
      .min(3, "Imię musi mieć co najmniej 3 znaki")
      .max(50, "Imię może mieć maksymalnie 50 znaków")
      .required("Imię gracza jest wymagane"),
    score: Yup.number()
      .positive("Wynik musi być liczbą dodatnią")
      .integer("Wynik musi być liczbą całkowitą")
      .required("Wynik jest wymagany"),
  });

  // Load scores from localStorage when component mounts
  useEffect(() => {
    const savedScores = localStorage.getItem('scoreboardData');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  // Calculate statistics whenever scores change and save to localStorage
  useEffect(() => {
    if (scores.length > 0) {
      setMedian(
        scores.reduce((sum, curr) => sum + curr.score, 0) / scores.length
      );
      setHighestScore(Math.max(...scores.map((s) => s.score)));
      
      // Save to localStorage whenever scores change
      localStorage.setItem('scoreboardData', JSON.stringify(scores));
    } else {
      setMedian(0);
      setHighestScore(0);
      
      // Clear localStorage if there are no scores
      localStorage.removeItem('scoreboardData');
    }
  }, [scores]);

  const addScore = (values, { resetForm }) => {
    const newScore = {
      id: scores.length > 0 ? Math.max(...scores.map((s) => s.id)) + 1 : 1,
      player: values.player,
      score: parseInt(values.score, 10),
    };

    setScores([...scores, newScore]);
    resetForm();
  };

  // Function to clear all scores
  const clearAllScores = () => {
    if (window.confirm('Czy na pewno chcesz usunąć wszystkie wyniki?')) {
      setScores([]);
      localStorage.removeItem('scoreboardData');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>Tablica Wyników</title>
        </Head>

        <main>
          <div className="navbar bg-base-100 rounded-box mb-6 shadow-lg">
            <div className="flex-1">
              <h1 className="text-2xl font-bold px-4">Tablica Wyników</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-title">Liczba graczy</div>
                <div className="stat-value text-primary">{scores.length}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-title">Średni wynik</div>
                <div className="stat-value text-secondary">{median.toFixed(1)}</div>
              </div>
            </div>

            <div className="stats shadow bg-base-100">
              <div className="stat">
                <div className="stat-title">Najlepszy wynik</div>
                <div className="stat-value text-accent">{highestScore}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Dodaj nowy wynik</h2>

                <Formik
                  initialValues={{ player: "", score: "" }}
                  validationSchema={ScoreSchema}
                  onSubmit={addScore}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Imię gracza</span>
                        </label>
                        <Field
                          id="player"
                          name="player"
                          type="text"
                          placeholder="Wpisz imię gracza"
                          className={`input input-bordered w-full ${
                            errors.player && touched.player ? "input-error" : ""
                          }`}
                        />
                        <ErrorMessage
                          name="player"
                          component="span"
                          className="text-error text-sm mt-1"
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Wynik</span>
                        </label>
                        <Field
                          id="score"
                          name="score"
                          type="number"
                          placeholder="Wpisz wynik"
                          className={`input input-bordered w-full ${
                            errors.score && touched.score ? "input-error" : ""
                          }`}
                        />
                        <ErrorMessage
                          name="score"
                          component="span"
                          className="text-error text-sm mt-1"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary w-full"
                      >
                        Dodaj wynik
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl md:col-span-2">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Najlepsze wyniki</h2>
                  {scores.length > 0 && (
                    <button 
                      onClick={clearAllScores}
                      className="btn btn-sm btn-error"
                    >
                      Wyczyść wszystko
                    </button>
                  )}
                </div>

                {scores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Lp.</th>
                          <th>Gracz</th>
                          <th>Wynik</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores
                          .sort((a, b) => b.score - a.score)
                          .map((score, index) => (
                            <tr key={score.id}>
                              <td>{index + 1}</td>
                              <td>{score.player}</td>
                              <td>
                                <div className="badge badge-primary">
                                  {score.score}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert">
                    <span>Brak wyników do wyświetlenia</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}