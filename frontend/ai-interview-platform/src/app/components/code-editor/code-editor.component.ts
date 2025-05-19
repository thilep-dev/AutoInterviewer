import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CodeAssessmentService, TestCase } from '../../services/code-assessment.service';
import { WebSocketService } from '../../services/websocket.service';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  providers: [MatSnackBar],
  template: `
    <div class="code-editor-container">
      <div class="editor-toolbar">
        <mat-form-field>
          <mat-label>Language</mat-label>
          <mat-select [(value)]="selectedLanguage" (selectionChange)="onLanguageChange()">
            <mat-option value="python">Python</mat-option>
            <mat-option value="javascript">JavaScript</mat-option>
            <mat-option value="java">Java</mat-option>
            <mat-option value="csharp">C#</mat-option>
            <mat-option value="cpp">C++</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="runCode()" [disabled]="isRunning">
          <mat-icon>play_arrow</mat-icon>
          {{isRunning ? 'Running...' : 'Run Code'}}
        </button>
      </div>
      
      <div #editorContainer class="editor-container"></div>

      <div class="test-cases" *ngIf="testCases.length > 0">
        <h3>Test Cases</h3>
        <mat-card *ngFor="let testCase of testCases; let i = index" class="test-case">
          <mat-card-header>
            <mat-card-title>Test Case {{i + 1}}</mat-card-title>
            <mat-card-subtitle>
              Status: {{testCase.status}}
              <mat-icon [ngClass]="testCase.status === 'Passed' ? 'success' : 'error'">
                {{testCase.status === 'Passed' ? 'check_circle' : 'error'}}
              </mat-icon>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="test-case-details">
              <div>
                <strong>Input:</strong>
                <pre>{{testCase.input}}</pre>
              </div>
              <div>
                <strong>Expected Output:</strong>
                <pre>{{testCase.expectedOutput}}</pre>
              </div>
              <div>
                <strong>Actual Output:</strong>
                <pre>{{testCase.actualOutput}}</pre>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .code-editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 1rem;
    }

    .editor-toolbar {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .editor-container {
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .test-cases {
      margin-top: 1rem;
    }

    .test-case {
      margin-bottom: 1rem;
    }

    .test-case-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    pre {
      background: #f5f5f5;
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0.5rem 0;
    }

    .success {
      color: #4caf50;
    }

    .error {
      color: #f44336;
    }
  `]
})
export class CodeEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  code: string = '';
  selectedLanguage: string = 'python';
  isRunning: boolean = false;
  testCases: TestCase[] = [];
  private destroy$ = new Subject<void>();

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'python',
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible'
    }
  };

  constructor(
    private codeAssessmentService: CodeAssessmentService,
    private webSocketService: WebSocketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeEditor();
    this.setupWebSocketListeners();
  }

  ngAfterViewInit() {
    this.createEditor();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private createEditor() {
    if (this.editorContainer) {
      this.editor = monaco.editor.create(this.editorContainer.nativeElement, this.editorOptions);
      this.editor.setValue(this.code);
      
      this.editor.onDidChangeModelContent(() => {
        this.code = this.editor?.getValue() || '';
      });
    }
  }

  private initializeEditor() {
    this.code = this.getInitialCode(this.selectedLanguage);
  }

  private setupWebSocketListeners() {
    this.webSocketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.type === 'code_execution') {
          this.handleCodeExecutionUpdate(message.data);
        } else if (message.type === 'test_result') {
          this.handleTestResultUpdate(message.data);
        }
      });
  }

  private handleCodeExecutionUpdate(data: any) {
    this.isRunning = data.status === 'running';
    if (data.status === 'completed') {
      this.snackBar.open('Code execution completed', 'Close', {
        duration: 3000
      });
    } else if (data.status === 'error') {
      this.snackBar.open(`Error: ${data.error}`, 'Close', {
        duration: 5000
      });
    }
  }

  private handleTestResultUpdate(data: any) {
    const testCaseIndex = this.testCases.findIndex(tc => tc.id === data.testCaseId);
    if (testCaseIndex !== -1) {
      this.testCases[testCaseIndex] = {
        ...this.testCases[testCaseIndex],
        ...data.result
      };
    }
  }

  onLanguageChange() {
    if (this.editor) {
      monaco.editor.setModelLanguage(this.editor.getModel()!, this.selectedLanguage);
      this.code = this.getInitialCode(this.selectedLanguage);
      this.editor.setValue(this.code);
    }
  }

  async runCode() {
    if (this.isRunning) return;

    this.isRunning = true;
    try {
      // Send code execution request through WebSocket
      this.webSocketService.sendCodeExecution(this.code, this.selectedLanguage);

      // Also send through HTTP for backup
      const result = await this.codeAssessmentService.submitCode(
        this.code,
        this.selectedLanguage,
        this.testCases.map(tc => tc.input)
      ).toPromise();

      if (result) {
        this.testCases = result.testCases;
      }
    } catch (error) {
      console.error('Error running code:', error);
      this.snackBar.open('Error running code. Please try again.', 'Close', {
        duration: 5000
      });
    } finally {
      this.isRunning = false;
    }
  }

  private getInitialCode(language: string): string {
    const templates: Record<string, string> = {
      python: `def solution(input_data):
    # Write your solution here
    return input_data

# Test your solution
test_input = "Hello, World!"
result = solution(test_input)
print(result)`,
      javascript: `function solution(inputData) {
    // Write your solution here
    return inputData;
}

// Test your solution
const testInput = "Hello, World!";
const result = solution(testInput);
console.log(result);`,
      java: `public class Solution {
    public static String solution(String inputData) {
        // Write your solution here
        return inputData;
    }

    public static void main(String[] args) {
        String testInput = "Hello, World!";
        String result = solution(testInput);
        System.out.println(result);
    }
}`,
      csharp: `using System;

public class Solution {
    public static string Solution(string inputData) {
        // Write your solution here
        return inputData;
    }

    public static void Main() {
        string testInput = "Hello, World!";
        string result = Solution(testInput);
        Console.WriteLine(result);
    }
}`,
      cpp: `#include <iostream>
#include <string>

std::string solution(std::string inputData) {
    // Write your solution here
    return inputData;
}

int main() {
    std::string testInput = "Hello, World!";
    std::string result = solution(testInput);
    std::cout << result << std::endl;
    return 0;
}`
    };

    return templates[language] || templates['python'];
  }
} 