import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

let translations: any = {};

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("translationKeyFinder");
  const translationFile = config.get<string>("translationFile") || "";
  const displayMode = config.get<string>("displayMode") || "after";

  loadTranslations(translationFile);

  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      margin: "0 0 0 1rem",
      color: "#888",
      fontStyle: "italic",
    },
  });

  const updateDecorations = (editor: vscode.TextEditor | undefined) => {
    if (!editor) {
      return;
    }

    const regex = /['\"]([A-Z0-9_.]+)['\"]/g; // also match double quotes
    const text = editor.document.getText();

    if (displayMode === "after") {
      const decorations: vscode.DecorationOptions[] = [];
      let match;
      while ((match = regex.exec(text))) {
        const key = match[1];
        const translation = getTranslationValue(key);
        if (translation) {
          const startPos = editor.document.positionAt(match.index);
          const endPos = editor.document.positionAt(
            match.index + match[0].length
          );
          decorations.push({
            range: new vscode.Range(startPos, endPos),
            renderOptions: { after: { contentText: `→ ${translation}` } },
          });
        }
      }
      editor.setDecorations(decorationType, decorations);
    }
  };

  if (displayMode === "hover") {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider("*", {
        provideHover(document, position) {
          const range = document.getWordRangeAtPosition(
            position,
            /['\"]([A-Z0-9_.]+)['\"]/
          );
          if (range) {
            const key = document.getText(range).replace(/['\"]/g, "");
            const translation = getTranslationValue(key);
            if (translation) {
              return new vscode.Hover(`**Translation:** ${translation}`);
            }
          }
          return null;
        },
      })
    );
  }

  if (displayMode === "codelens") {
    class TranslationLensProvider implements vscode.CodeLensProvider {
      onDidChangeCodeLenses?: vscode.Event<void> | undefined;
      provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const lenses: vscode.CodeLens[] = [];
        const regex = /['\"]([A-Z0-9_.]+)['\"]/g;
        const text = document.getText();
        let match;
        while ((match = regex.exec(text))) {
          const key = match[1];
          const translation = getTranslationValue(key);
          if (translation) {
            const pos = document.positionAt(match.index);
            lenses.push(
              new vscode.CodeLens(new vscode.Range(pos, pos), {
                title: translation,
                command: "",
              })
            );
          }
        }
        return lenses;
      }
    }
    context.subscriptions.push(
      vscode.languages.registerCodeLensProvider(
        { scheme: "file" },
        new TranslationLensProvider()
      )
    );
  }

  vscode.window.onDidChangeActiveTextEditor(updateDecorations);
  vscode.workspace.onDidChangeTextDocument((e) => {
    if (
      vscode.window.activeTextEditor &&
      e.document === vscode.window.activeTextEditor.document
    ) {
      updateDecorations(vscode.window.activeTextEditor);
    }
  });

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

function loadTranslations(filePath: string) {
  if (!filePath) {
    console.error("Translation file path is not defined in settings.");
    return;
  }

  try {
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(
          vscode.workspace.workspaceFolders?.[0].uri.fsPath || "",
          filePath
        );

    if (!fs.existsSync(absPath)) {
      console.error("Not found file:", absPath);
      return;
    }

    const content = fs.readFileSync(absPath, "utf-8");
    translations = JSON.parse(content);
    console.log("Loaded translations from:", absPath);
  } catch (err) {
    console.error("Failed to load translations:", err);
  }
}

function getTranslationValue(key: string): string | undefined {
  if (translations[key]) {
    return translations[key];
  }

  const parts = key.split(".");
  let current = translations;
  for (const part of parts) {
    if (current[part] !== undefined) {
      current = current[part];
    } else {
      return undefined; // Key not found
    }
  }
  return current as string; // Return the final value
}

export function deactivate() {}
