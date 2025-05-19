import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'Pending' | 'Running' | 'Passed' | 'Failed';
}

export interface CodeExecutionResult {
  testCases: TestCase[];
  executionTime: number;
  memoryUsage: number;
}

@Injectable({
  providedIn: 'root'
})
export class CodeAssessmentService {
  constructor(private http: HttpClient) {}

  submitCode(code: string, language: string, testCases: string[]): Observable<CodeExecutionResult> {
    return this.http.post<CodeExecutionResult>(`${environment.apiUrl}/code/execute`, {
      code,
      language,
      testCases
    });
  }

  getTestCases(questionId: string): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${environment.apiUrl}/questions/${questionId}/test-cases`);
  }
} 