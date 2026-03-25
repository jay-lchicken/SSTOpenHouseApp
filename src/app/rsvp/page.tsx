'use client';
import { FormEvent, useState } from 'react';
import formData from '../form.json';

type Question = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  options?: string[];
  otherOption?: boolean;
  conditionalOn?: {
    questionId: string;
    value: string;
  };
};

type Section = {
  sectionTitle: string;
  sectionDescription?: string;
  questions: Question[];
};

function flattenQuestions(sections: Section[]): Question[] {
  return sections.flatMap((section) => section.questions);
}

export default function RSVPPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const allQuestions = flattenQuestions(formData.sections as Section[]);

  const currentQuestion = allQuestions[currentQuestionIndex];

  function shouldShowQuestion(question: Question): boolean {
    if (!question.conditionalOn) return true;
    const dependentValue = answers[question.conditionalOn.questionId];
    return dependentValue === question.conditionalOn.value;
  }

  function getVisibleQuestions(): Question[] {
    return allQuestions.filter((q) => shouldShowQuestion(q));
  }

  const visibleQuestions = getVisibleQuestions();
  const visibleCurrentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  function handleAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (
      visibleCurrentQuestion?.required &&
      !answers[visibleCurrentQuestion.id]
    ) {
      setErrorMsg('This field is required.');
      return;
    }
    setErrorMsg('');
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function handleBack() {
    setErrorMsg('');
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }

  function handleSubmitForm() {
    console.log('Submitting:', answers);
    setStatus('success');
  }

  async function handleRSVP(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please fill in your name and email.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/openhouse-rsvp', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || 'Something went wrong. Please try again.',
        );
      }

      setStatus('success');
    } catch (err: any) {
      if (err && 'message' in err) {
        setErrorMsg(err.message);
        setStatus('error');
      }
    }
  }

  function renderQuestionInput(question: Question) {
    const value = answers[question.id] || '';

    switch (question.type) {
      case 'email':
        return (
          <input
            className="rsvp-input"
            type="email"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your email"
          />
        );
      case 'text':
        return (
          <input
            className="rsvp-input"
            type="text"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your answer"
          />
        );
      case 'dropdown':
        return (
          <select
            className="rsvp-select"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {question.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'multipleChoice':
        return (
          <div className="rsvp-options-list">
            {question.options?.map((opt) => (
              <label key={opt} className="rsvp-option-label">
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                />
                {opt}
              </label>
            ))}
            {question.otherOption && (
              <>
                <label className="rsvp-option-label">
                  <input
                    type="radio"
                    name={question.id}
                    value="Other"
                    checked={value === 'Other'}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                  />
                  Other
                </label>
                {value === 'Other' && (
                  <input
                    className="rsvp-input rsvp-other-input"
                    type="text"
                    placeholder="Please specify"
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                  />
                )}
              </>
            )}
          </div>
        );
      case 'multipleTickbox': {
        const currentValues = (value as string[]) || [];
        const handleCheckbox = (opt: string) => {
          if (currentValues.includes(opt)) {
            handleAnswer(
              question.id,
              currentValues.filter((v) => v !== opt),
            );
          } else {
            handleAnswer(question.id, [...currentValues, opt]);
          }
        };
        const otherChecked = currentValues.includes('Other');
        return (
          <div className="rsvp-options-list">
            {question.options?.map((opt) => (
              <label key={opt} className="rsvp-option-label">
                <input
                  type="checkbox"
                  checked={currentValues.includes(opt)}
                  onChange={() => handleCheckbox(opt)}
                />
                {opt}
              </label>
            ))}
            {question.otherOption && (
              <>
                <label className="rsvp-option-label">
                  <input
                    type="checkbox"
                    checked={otherChecked}
                    onChange={() => handleCheckbox('Other')}
                  />
                  Other
                </label>
                {otherChecked && (
                  <input
                    className="rsvp-input rsvp-other-input"
                    type="text"
                    placeholder="Please specify"
                    onChange={(e) =>
                      handleAnswer(question.id, [
                        ...currentValues.filter((v) => v !== 'Other'),
                        e.target.value,
                      ])
                    }
                  />
                )}
              </>
            )}
          </div>
        );
      }
      default:
        return (
          <input
            className="rsvp-input"
            type="text"
            value={value as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        );
    }
  }

  if (status === 'success') {
    return (
      <div className="app-domain rsvp-page">
        <div className="texts">
          <h1>You're in! 🎉</h1>
          <h3>We've received your RSVP. See you at SST Open House 2026!</h3>
        </div>
      </div>
    );
  }

  if (showForm) {
    const progressPercent =
      ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;

    return (
      <div className="app-domain rsvp-page">
        <div className="texts rsvp-form-view">
          <div className="rsvp-form-card">
            <p className="rsvp-form-title">{formData.formTitle}</p>

            {/* Progress bar */}
            <div className="rsvp-progress-wrap">
              <div className="rsvp-progress-track">
                <div
                  className="rsvp-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="rsvp-progress-label">
                <span>
                  Question {currentQuestionIndex + 1} of{' '}
                  {visibleQuestions.length}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
            </div>

            {visibleCurrentQuestion && (
              <div>
                <label className="rsvp-question-label">
                  {visibleCurrentQuestion.label}
                  {visibleCurrentQuestion.required && (
                    <span className="rsvp-required"> *</span>
                  )}
                </label>
                {visibleCurrentQuestion.description && (
                  <p className="rsvp-question-description">
                    {visibleCurrentQuestion.description}
                  </p>
                )}
                {renderQuestionInput(visibleCurrentQuestion)}
                {errorMsg && <p className="rsvp-error">{errorMsg}</p>}
              </div>
            )}

            <div className="rsvp-nav-buttons">
              {!isFirstQuestion && (
                <button
                  className="rsvp-button rsvp-button-back"
                  onClick={handleBack}
                >
                  <h3>Back</h3>
                </button>
              )}
              {isLastQuestion ? (
                <button className="rsvp-button" onClick={handleSubmitForm}>
                  <h3>Submit</h3>
                </button>
              ) : (
                <button className="rsvp-button" onClick={handleNext}>
                  <h3>Proceed</h3>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-domain rsvp-page">
      <div className="texts">
        <h1>
          <span>RSVP</span> for SST Open House 2026!
        </h1>
        <h3>
          Get ready for immersive experiences to help decide if SST is the
          school for you!
        </h3>
        {/* <form onSubmit={handleRSVP}>
            <input
                className="rsvp-input"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {status === 'error' && <p>{errorMsg}</p>}
            <div className="but-cont">
              <button className="rsvp-button" type="submit" disabled={status === 'loading'}>
                <h3>{status === 'loading' ? 'Submitting...' : 'RSVP NOW!'}</h3>
              </button>
            </div>
          </form> */}
        <div className="but-cont">
          <button className="rsvp-button" onClick={() => setShowForm(true)}>
            <h3>RSVP NOW!</h3>
          </button>
        </div>
      </div>
    </div>
  );
}
