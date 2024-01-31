import Quill, { Delta } from "quill";
import { useEffect } from "react";
import { commentTypes, reviewCategories } from "../lib/options";
import {
  forceShowPlaceholder,
  hasQuillContent,
  insertReviewCategory,
  placeCursorAtEnd,
  trimQuillEditorContents,
  focusEditor,
} from "../lib/quill";
import { COMMENT_TYPES } from "../lib/types";
import { comment } from "~/redux/discussion/shims";

function useEffectForCommentTypeChange({
  commentType,
  quill,
  quillRef,
  isReady,
  editorId,
}: {
  commentType: string;
  quill: Quill | undefined;
  quillRef: any;
  isReady: boolean;
  editorId: string;
}) {
  useEffect(() => {
    if (!(isReady && quill)) {
      return;
    }
    if (commentType === COMMENT_TYPES.REVIEW) {
      quill?.enable();

      const reviewAlreadySelected = hasQuillContent({
        quill,
        contentType: "peer-review-rating",
      });
      if (reviewAlreadySelected) {
        return;
      }

      quillRef.current.classList.add("peer-review");

      insertReviewCategory({
        category: reviewCategories.overall,
        index: 0,
        quill,
        quillRef,
      });
    } else if (commentType === COMMENT_TYPES.PROPOSAL) {
      // HAM 01/29/24:
      // This else if block can't be the best way to do this but works for now
      // Was modelling off of REVIEW block from above combined with quill docs

      quillRef.current.classList.remove("peer-review");
      quillRef.current.classList.add("proposal");

      if (!hasQuillContent({ quill })) {
        const delta: any = {
          ops: [
            { insert: "Proposal Title:", attributes: { bold: true } },
            { insert: " ", attributes: { bold: false } },
            { insert: "\n\n" },
            { insert: "Introduction:", attributes: { bold: true } },
            { insert: " ", attributes: { bold: false } },
            { insert: "\n\n" },
            { insert: "Materials/Methods:", attributes: { bold: true } },
            { insert: " ", attributes: { bold: false } },
            { insert: "\n\n" },
            { insert: "Budget:", attributes: { bold: true } },
            { insert: " ", attributes: { bold: false } },
            { insert: "\n\n" },
            {
              insert: "Authors, Affiliations, References:",
              attributes: { bold: true },
            },
            { insert: " ", attributes: { bold: false } },
            { insert: "\n\n" },
          ],
        };
        quill.setContents(delta);
      }

      const trimmedContents = trimQuillEditorContents({
        contents: quill.getContents(),
      });
      quill.setContents(trimmedContents);
    } else {
      quillRef.current.classList.remove("peer-review");
      const contents = quill.getContents();
      let editorWithoutPeerReviewBlocks;

      if (contents) {
        editorWithoutPeerReviewBlocks = contents.ops?.filter(
          (op) => !op.insert["peer-review-rating"]
        );
        quill.setContents(editorWithoutPeerReviewBlocks);
      }

      const trimmedContents = trimQuillEditorContents({
        contents: quill.getContents(),
      });
      quill.setContents(trimmedContents);
    }

    const hasContent = hasQuillContent({ quill });
    if (!hasContent) {
      forceShowPlaceholder({
        quillRef,
        placeholderText: commentTypes.find(
          (ctype) => ctype.value === commentType
        )?.placeholder,
      });
    }

    focusEditor({ quill });
  }, [commentType, isReady, quill, editorId]);
}

export default useEffectForCommentTypeChange;
