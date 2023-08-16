/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor, onNavigate } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES } from "../constants/routes"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = "<div id='root'></div>"
      router()
    })

    test("Then if file format is not jpg, jpeg or png, a warning message should appears", () => {
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e))
      const btnChange = screen.getByTestId('file')
      const msgWarning = screen.getByTestId("warning")

      // Set incorrect file extension
      const justificatifFile = new File(["img"], "justificatif.pdf", { type: "application/pdf" })

      btnChange.addEventListener("change", handleChange)
      fireEvent.change(btnChange, { target: { files: [justificatifFile] } })

      expect(msgWarning.classList).not.toContain("hidden")
    })

    test("If file format is jpg, jpeg or png, a warning message should not appears", () => {
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e))
      const btnChange = screen.getByTestId('file')
      const msgWarning = screen.getByTestId("warning")

      // Set correct file extension
      const justificatifFile = new File(["img"], "justificatif.png", { type: "image/png" })

      btnChange.addEventListener("change", handleChange)
      fireEvent.change(btnChange, { target: { files: [justificatifFile] } })

      expect(msgWarning.classList).toContain("hidden")
    })

    test("If form's data is correct, new bill is created", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const bill = {
        email: "employee@test.tld",
        type: "Hôtel et logement",
        name: "Hôtel du centre ville",
        amount: 120,
        date: "2022-12-30",
        vat: "10",
        pct: 10,
        commentary: "",
        fileUrl: "justificatif.png",
        fileName: "justificatif",
        status: 'pending'
      };

      const type = screen.getByTestId("expense-type");
      fireEvent.change(type, { target: { value: bill.type } });
      expect(type.value).toBe(bill.type);

      const name = screen.getByTestId("expense-name");
      fireEvent.change(name, { target: { value: bill.name } });
      expect(name.value).toBe(bill.name);

      const date = screen.getByTestId("datepicker");
      fireEvent.change(date, { target: { value: bill.date } });
      expect(date.value).toBe(bill.date);

      const amount = screen.getByTestId("amount");
      fireEvent.change(amount, { target: { value: bill.amount } });
      expect(parseInt(amount.value)).toBe(parseInt(bill.amount));

      const vat = screen.getByTestId("vat");
      fireEvent.change(vat, { target: { value: bill.vat } });
      expect(parseInt(vat.value)).toBe(parseInt(bill.vat));

      const pct = screen.getByTestId("pct");
      fireEvent.change(pct, { target: { value: bill.pct } });
      expect(parseInt(pct.value)).toBe(parseInt(bill.pct));

      const commentary = screen.getByTestId("commentary");
      fireEvent.change(commentary, { target: { value: bill.commentary } });
      expect(commentary.value).toBe(bill.commentary);

      const newBillForm = screen.getByTestId("form-new-bill");
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      newBillForm.addEventListener("change", handleChangeFile);

      const justificatifFile = new File([bill.fileName], bill.fileUrl, { type: "image/png"})

      const fileUpload = screen.getByTestId("file");
      fireEvent.change(fileUpload, { target: { files: [justificatifFile] } });
      expect(fileUpload.files[0].name).toBe(bill.fileUrl);
      expect(fileUpload.files[0].type).toBe("image/png");
      expect(handleChangeFile).toHaveBeenCalled();

      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
